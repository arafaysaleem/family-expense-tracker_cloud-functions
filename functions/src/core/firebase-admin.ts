import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue as fieldValue } from 'firebase-admin/firestore';

export const FIRESTORE_DB_NAME = process.env.FIRESTORE_DB_NAME || undefined;

// Initialize the Firebase Admin SDK
const app = initializeApp();

// Export a Firestore instance
export const FieldValue = fieldValue;
export const firestore = FIRESTORE_DB_NAME !== undefined ?
  getFirestore(app, FIRESTORE_DB_NAME!) :
  getFirestore(app);
