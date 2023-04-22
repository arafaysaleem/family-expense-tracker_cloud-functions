import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK
admin.initializeApp();

// Export a Firestore instance
export const firestore = admin.firestore();
