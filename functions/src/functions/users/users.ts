import * as functions from 'firebase-functions';
import { firestore } from '../../core/firebase-admin';
import { FirestorePaths } from '../../core/firestore-paths';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { BookFields } from '../books/books';

interface User {
  uid: string;
  displayName: string;
  email: string;
  image_url: string;
  owned_book_ids: string[];
  shared_book_ids: string[];
}

class UserFields {
  static image_url = 'image_url';
}

export const createNewUser = functions.auth
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

export const updateUserImageAcrossBooks = onDocumentUpdated(
  `${FirestorePaths.USERS}/{userId}`,
  async (event) => {
    const change = event.data!;
    const newUser = change.after.data() as User;
    const imageUrlBefore = change.before.get(UserFields.image_url) as string;

    // If the image url hasn't changed, do nothing
    if (imageUrlBefore === newUser.image_url) return;

    // Get the all the owned and shared books of the user
    const books = [...newUser.owned_book_ids, ...newUser.shared_book_ids];

    // Replace the image url from each of their members map
    try {
      const batch = firestore.batch();

      books.forEach((bookId) => {
        const bookRef = firestore.collection(FirestorePaths.BOOKS).doc(bookId);
        const imageFieldRef = `${BookFields.members}.${newUser.uid}.${UserFields.image_url}`;
        batch.update(bookRef, { [imageFieldRef]: newUser.image_url });
      });

      await batch.commit();
    } catch (error) {
      console.error(error);
    }
  });
