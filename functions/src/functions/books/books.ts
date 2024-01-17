import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { FieldValue, firestore } from '../../core/firebase-admin';
import { FirestorePaths } from '../../core/firestore-paths';
import { DefaultsType } from '../../enums/defaults_type.enum';
import { Wallet } from '../wallets/wallets';

interface Member {
  role: string;
  image_url: string;
}

export class BookFields {
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
      const defaultsRef = firestore.collection(FirestorePaths.DEFAULTS);
      const defaultWalletsRef = defaultsRef.doc(DefaultsType.Wallets);
      const defaultCategoriesRef = defaultsRef.doc(DefaultsType.Categories);

      const defaultWallets: Array<Wallet> = (await defaultWalletsRef.get()).data()!.items;
      const defaultCategories: Array<Wallet> = (await defaultCategoriesRef.get()).data()!.items;

      // Create a new 'wallets' collection for the book
      const bookRef = firestore.collection(FirestorePaths.BOOKS).doc(bookId);
      const walletsRef = bookRef.collection(FirestorePaths.WALLETS);
      const categoriesRef = bookRef.collection(FirestorePaths.CATEGORIES);

      // Add the default wallets to the 'wallets' collection
      const wallets = defaultWallets.map((wallet) => walletsRef.doc(wallet.id).set(wallet));
      const categories = defaultCategories.map((category) => categoriesRef.doc(category.id).set(category));
      await Promise.all([
        ...wallets,
        ...categories
      ]);
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

