/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable max-len */
/* eslint-disable object-curly-spacing */
/* eslint-disable eol-last */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { AxiosRequestConfig } from 'axios';
import { DateTime } from 'luxon';

// Init project
admin.initializeApp();

// Get the firestore db
const db = admin.firestore();

export const taskCreator = functions.runWith({ timeoutSeconds: 300 }).pubsub
    .schedule('0 6 * * *')
    .timeZone('Asia/Kolkata')
    .onRun(async (_) => {
        // Delete all previous fixtures
        try {
            const querySnapshot = await db.collection('fixtures').get();
            querySnapshot.docs.forEach(async (snapshot) => await snapshot.ref.delete());
        } catch (err) {
            console.error(err);
            throw err;
        }

        // Set query filters for today live matches
        const nowDate = DateTime.now().setZone('Asia/Kolkata');
        const startDate = nowDate.toISODate();
        const nextDate = nowDate.plus({ days: 1 });
        const endDate = nextDate.toISODate();
        const sort = 'sort=starting_at';
        const include = 'include=runs,venue.country,visitorteam,localteam,league';
        const dateFilter = `filter[starts_between]=${startDate},${endDate}`;
        const query = `api_token=${process.env.API_KEY}&${sort}&${include}&${dateFilter}`;

        // Fetch today live matches
        const options: AxiosRequestConfig = {
            baseURL: process.env.BASE_URL,
            method: 'get',
            url: `/fixtures?${query}`,
        };

        try {
            const response = await makeRequest(options);
            const data: [] = response.data;
            if (data.length === 0) throw new Error(`No fixtures data available, data: ${JSON.stringify(data)}`);

            // Create tasks at each match's starting time
            const tasks = db.collection('tasks');
            data.forEach((fixture: any) => {
                const task = {
                    'performAt': admin.firestore.Timestamp.fromDate(new Date(fixture.starting_at)),
                    'status': 'scheduled',
                    'worker': 'fetchLiveScore',
                    'options': {
                        'fixtureId': fixture.id,
                    },
                };
                tasks.doc(`${fixture.id}`).set(task, { merge: true });
            });
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

export const taskRunner = functions.runWith({ memory: '1GB', timeoutSeconds: 540 }).pubsub
    .schedule('* * * * *')
    .timeZone('Asia/Kolkata')
    .onRun(async (_) => {
        // Consistent timestamp
        const now = admin.firestore.Timestamp.now();

        // Query all documents ready to perform
        const query = db.collection('tasks')
            .where('performAt', '<=', now)
            .where('status', '==', 'scheduled');

        const tasks = await query.get();

        if (tasks.empty) {
            console.info('No tasks waiting to be run at the moment');
            return;
        }

        // Jobs to execute concurrently.
        const jobs: Promise<any>[] = [];

        // Loop over documents and push job.
        tasks.forEach((snapshot) => {
            const { worker, options } = snapshot.data();

            // Add job for all matches that need live score fetching
            const job = workers[worker](options.fixtureId)

                // Update doc with status on error
                .catch((err: unknown) => snapshot.ref.update({ status: 'error', reason: `${err}` }));

            jobs.push(job);
        });

        // Execute all jobs concurrently
        return await Promise.all(jobs);
    });

const makeRequest = async (options: AxiosRequestConfig) => {
    const axios = (await import('axios')).default;
    console.log(`url: ${options.url}`);
    const res = await axios.request(options);
    try {
        if (res.status! >= 200 && res.status! < 300) {
            console.log(`status: ${res.status}, body: ${JSON.stringify(res.data)}`);
            return res.data;
        } else {
            throw new Error('Request failed. status: ' + res.status! + ', body: ' + JSON.stringify(res.data));
        }
    } catch (err) {
        console.error(err);
        throw new Error(`${err}`);
    }
};

const fetchLiveScore = async (fixtureId: number) => {
    // Change task to running to prevent double run
    const task = db.collection('tasks').doc(`${fixtureId}`);
    try {
        await task.set({ 'status': 'running' }, { merge: true });

        const sort = 'sort=starting_at';
        const include = 'include=batting.batsman,batting.team,bowling.bowler,balls,runs,venue,visitorteam,localteam,league';
        const query = `api_token=${process.env.API_KEY}&${sort}&${include}`;
        const AxiosRequestConfig: AxiosRequestConfig = {
            baseURL: process.env.BASE_URL,
            method: 'get',
            url: `/fixtures/${fixtureId}?${query}`,
        };
        const response = await makeRequest(AxiosRequestConfig);

        const data: Record<string, unknown> = response.data;
        if (Object.keys(data).length === 0) throw new Error('No fixture data available');

        // Save live score in document
        const fixture = db.doc(`fixtures/${fixtureId}`);
        await fixture.set({ 'data': data }, { merge: true });

        // Check if match finished
        if (data.live == false || data.status == 'Finished') {
            // Then remove the task(dont read it's score anymore)
            await task.delete();
        } else {
            // Else schedule the task to read score again
            await task.set({ 'status': 'scheduled' }, { merge: true });
        }
    } catch (error) {
        await task.set({ 'status': 'scheduled' }, { merge: true });
        console.error(error);
        return error;
    }
};

// Optional interface, all worker functions should return Promise.
interface Workers {
    [key: string]: (fixtureId: number) => Promise<any>
}

// Business logic for named tasks. Key should match `worker` field on task document.
// You can add a record for any other functions over here
const workers: Workers = {
    'fetchLiveScore': fetchLiveScore,
};