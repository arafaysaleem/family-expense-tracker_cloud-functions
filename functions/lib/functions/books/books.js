"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBookToMember = exports.addBookToOwner = void 0;
const functions = require("firebase-functions");
const firebase_admin_1 = require("../../core/firebase-admin");
const firestore_paths_1 = require("../../core/firestore-paths");
const defaults_type_enum_1 = require("../../enums/defaults_type.enum");
class BookFields {
}
BookFields.members = 'members';
var BookRoles;
(function (BookRoles) {
    BookRoles["owner"] = "owner";
})(BookRoles || (BookRoles = {}));
exports.addBookToOwner = functions.firestore
    .document(`${firestore_paths_1.FirestorePaths.BOOKS}/{bookId}`)
    .onCreate(async (snapshot) => {
    const bookId = snapshot.id;
    const membersMap = snapshot.get(BookFields.members);
    const ownerId = Object.keys(membersMap).find((memberId) => membersMap[memberId].role === BookRoles.owner);
    try {
        // Get the user document from the 'users' collection
        const userRef = firebase_admin_1.firestore.collection(firestore_paths_1.FirestorePaths.USERS).doc(ownerId);
        // Add the new book id to the user's 'owned_book_ids' array
        const ownedBookIds = firebase_admin_1.FieldValue.arrayUnion(bookId);
        await userRef.update({ owned_book_ids: ownedBookIds });
        // Get the new book defaults from the 'defaults' collection
        const defaultWalletsRef = firebase_admin_1.firestore.collection(firestore_paths_1.FirestorePaths.DEFAULTS).doc(defaults_type_enum_1.default.Wallets);
        const defaultWallets = (await defaultWalletsRef.get()).data().items;
        // Create a new 'wallets' collection for the book
        const walletsRef = firebase_admin_1.firestore.collection(firestore_paths_1.FirestorePaths.BOOKS).doc(bookId).collection(firestore_paths_1.FirestorePaths.WALLETS);
        // Add the default wallets to the 'wallets' collection
        const wallets = defaultWallets.map((wallet) => walletsRef.doc(wallet.id).set(wallet));
        await Promise.all(wallets);
    }
    catch (error) {
        console.error(error);
    }
});
exports.addBookToMember = functions.firestore
    .document(`${firestore_paths_1.FirestorePaths.BOOKS}/{bookId}`)
    .onUpdate(async (change) => {
    const bookId = change.after.id;
    const membersMap = change.after.get(BookFields.members);
    // Get the new members, i.e. members that weren't in the book before
    const newMemberId = Object.keys(membersMap).find((memberId) => !change.before.get(BookFields.members)[memberId]);
    if (!newMemberId) {
        console.error('No new members found for book', bookId);
        return;
    }
    try {
        // Get the user document from the 'users' collection, assuming there's only one new member
        const userRef = firebase_admin_1.firestore.collection(firestore_paths_1.FirestorePaths.USERS).doc(newMemberId);
        // Add the new book id to the user's 'shared_book_ids' array
        const sharedBookIds = firebase_admin_1.FieldValue.arrayUnion(bookId);
        await userRef.update({ shared_book_ids: sharedBookIds });
    }
    catch (error) {
        console.error(error);
    }
});
//# sourceMappingURL=books.js.map