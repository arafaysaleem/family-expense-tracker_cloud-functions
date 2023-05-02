import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK
admin.initializeApp();

// Export a Firestore instance
export const FieldValue = admin.firestore.FieldValue;
export const firestore = admin.firestore();
