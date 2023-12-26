import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { FieldValue, firestore } from '../../core/firebase-admin';
import { FirestorePaths } from '../../core/firestore-paths';
import { DefaultsType } from '../../enums/defaults_type.enum';
import { Wallet } from '../wallets/wallets';

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

export const setupNewBookDefaults = onDocumentCreated(
  `${FirestorePaths.BOOKS}/{bookId}`,
  async (event) => {
    const snapshot = event.data!;
    const bookId = snapshot.id;

    try {
      // Get the new book defaults from the 'defaults' collection
      const defaultWalletsRef = firestore.collection(FirestorePaths.DEFAULTS).doc(DefaultsType.Wallets);

      const defaultWallets: Array<Wallet> = (await defaultWalletsRef.get()).data()!.items;

      // Create a new 'wallets' collection for the book
      const walletsRef = firestore.collection(FirestorePaths.BOOKS).doc(bookId).collection(FirestorePaths.WALLETS);

      // Add the default wallets to the 'wallets' collection
      const wallets = defaultWallets.map((wallet) => walletsRef.doc(wallet.id).set(wallet));
      await Promise.all(wallets);
    } catch (error) {
      console.error(error);
    }
  });

export const deleteBookFromMembers = onDocumentDeleted(
  `${FirestorePaths.BOOKS}/{bookId}`,
  async (event) => {
    const snap = event.data!;
    const bookData = snap.data();
    const membersMap = bookData.get(BookFields.members) as Record<string, Member>;

    for (const memberId of Object.keys(membersMap)) {
      try {
        const member = membersMap[memberId];

        // Get the user document from the 'users' collection
        const userRef = firestore.collection(FirestorePaths.USERS).doc(memberId);

        // Remove the book id from the user's 'owned_book_ids' array if the user is the owner
        // Otherwise, remove the book id from the user's 'shared_book_ids' array
        const bookIdsArr = FieldValue.arrayRemove(event.params.bookId);
        if (member.role === BookRoles.owner) {
          await userRef.update({ owned_book_ids: bookIdsArr });
        } else {
          await userRef.update({ shared_book_ids: bookIdsArr });
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

