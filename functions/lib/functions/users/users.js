"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewUser = void 0;
const functions = require("firebase-functions");
const firebase_admin_1 = require("../../core/firebase-admin");
const firestore_paths_1 = require("../../core/firestore-paths");
exports.createNewUser = functions.auth
    .user()
    .onCreate(async (user) => {
    const { uid, displayName, email, photoURL } = user;
    try {
        // Create a new document with the user id as the document id
        const userRef = firebase_admin_1.firestore.collection(firestore_paths_1.FirestorePaths.USERS).doc(uid);
        // Set the fields of the new document
        await userRef.set({
            uid,
            displayName,
            email,
            image_url: photoURL,
            owned_book_ids: [],
            shared_book_ids: []
        });
    }
    catch (error) {
        console.error(error);
    }
});
//# sourceMappingURL=users.js.map