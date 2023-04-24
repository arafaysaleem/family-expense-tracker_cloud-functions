import * as functions from 'firebase-functions';
import { firestore } from './firebase-admin';
import { FirestorePaths } from './firestore-paths';

export const createUserDocument = functions.auth
  .user()
  .onCreate(async (user) => {
    const { uid, displayName, email, photoURL } = user;

    try {
      // Create a new document with the user id as the document id
      const userRef = firestore.collection(FirestorePaths.USERS).doc(uid);

      // Set the fields of the new document
      await userRef.set({
        uid,
        displayName,
        email,
        image_url: photoURL,
        owned_book_ids: [],
        shared_book_ids: []
      });
    } catch (error) {
      console.error(error);
    }
  });
