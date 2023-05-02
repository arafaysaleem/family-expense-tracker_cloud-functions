import * as functions from 'firebase-functions';
import { FieldValue, firestore } from '../../core/firebase-admin';
import { FirestorePaths } from '../../core/firestore-paths';

interface Member {
  role: string;
  image_url: string;
}

class BookFields {
  static members = 'members';
}

enum BookRoles {
  owner = 'owner',
}

export const addBookToOwner = functions.firestore
  .document(`${FirestorePaths.BOOKS}/{bookId}`)
  .onCreate(async (snapshot) => {
    const bookId = snapshot.id;
    const membersMap = snapshot.get(BookFields.members) as Record<string, Member>;

    const ownerId = Object.keys(membersMap).find((memberId) => membersMap[memberId].role === BookRoles.owner)!;

    try {
      // Get the user document from the 'users' collection
      const userRef = firestore.collection(FirestorePaths.USERS).doc(ownerId);

      // Add the new book id to the user's 'owned_book_ids' array
      const ownedBookIds = FieldValue.arrayUnion(bookId);
      await userRef.update({ owned_book_ids: ownedBookIds });
    } catch (error) {
      console.error(error);
    }
  });

export const addBookToMember = functions.firestore
  .document(`${FirestorePaths.BOOKS}/{bookId}`)
  .onUpdate(async (change) => {
    const bookId = change.after.id;
    const membersMap = change.after.get(BookFields.members) as Record<string, Member>;

    // Get the new members, i.e. members that weren't in the book before
    const newMemberId = Object.keys(membersMap).find((memberId) => !change.before.get(BookFields.members)[memberId]);

    if (!newMemberId) {
      console.error('No new members found for book', bookId);
      return;
    }

    try {
      // Get the user document from the 'users' collection, assuming there's only one new member
      const userRef = firestore.collection(FirestorePaths.USERS).doc(newMemberId);

      // Add the new book id to the user's 'shared_book_ids' array
      const sharedBookIds = FieldValue.arrayUnion(bookId);
      await userRef.update({ shared_book_ids: sharedBookIds });
    } catch (error) {
      console.error(error);
    }
  });
