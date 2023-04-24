import * as functions from 'firebase-functions';
import { firestore } from './firebase-admin';
import { FirestorePaths } from './firestore-paths';

interface Member {
  role: string;
  image_url: string;
}

class BookFields {
  static members = 'members';
}

class UserFields {
  static ownedBookIds = 'owned_book_ids';
  static sharedBookIds = 'shared_book_ids';
}

enum BookRoles {
  owner = 'owner',
}

export const addBookToOwner = functions.firestore
  .document(`${FirestorePaths.BOOKS}/{bookId}`)
  .onCreate(async (snapshot) => {
    const bookId = snapshot.id;
    const membersMap = snapshot.get(BookFields.members) as Record<string, Member>;

    const ownerId = Object.keys(membersMap).find((memberId) => membersMap[memberId].role === BookRoles.owner);

    if (!ownerId) {
      console.error('No owner found for book', bookId);
      return;
    }

    try {
      // Get the user document from the 'users' collection
      const userRef = firestore.collection(FirestorePaths.USERS).doc(ownerId);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        // Add the new book id to the user's 'owned_book_ids' array
        const ownedBookIds = userDoc.get(UserFields.ownedBookIds) || [];
        ownedBookIds.push(bookId);
        await userRef.update({ owned_book_ids: ownedBookIds });
      }
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
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        // Add the new book id to the user's 'shared_book_ids' array
        const sharedBookIds = userDoc.get(UserFields.sharedBookIds) || [];
        sharedBookIds.push(bookId);
        await userRef.update({ shared_book_ids: sharedBookIds });
      }
    } catch (error) {
      console.error(error);
    }
  });
