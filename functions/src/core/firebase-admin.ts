import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue as fieldValue } from 'firebase-admin/firestore';

// Initialize the Firebase Admin SDK
initializeApp();

// Export a Firestore instance
export const firestore = getFirestore();
export const FieldValue = fieldValue;
