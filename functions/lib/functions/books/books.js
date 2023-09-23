"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBookFromMembers = exports.addBookToMember = exports.addBookToOwner = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
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
exports.addBookToOwner = (0, firestore_1.onDocumentCreated)({
    database: firebase_admin_1.FIRESTORE_DB_NAME,
    document: `${firestore_paths_1.FirestorePaths.BOOKS}/{bookId}`
}, async (event) => {
    const snapshot = event.data;
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
        const defaultWalletsRef = firebase_admin_1.firestore.collection(firestore_paths_1.FirestorePaths.DEFAULTS).doc(defaults_type_enum_1.DefaultsType.Wallets);
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
exports.addBookToMember = (0, firestore_1.onDocumentUpdated)({
    database: firebase_admin_1.FIRESTORE_DB_NAME,
    document: `${firestore_paths_1.FirestorePaths.BOOKS}/{bookId}`
}, async (event) => {
    const change = event.data;
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
exports.deleteBookFromMembers = (0, firestore_1.onDocumentDeleted)({
    database: firebase_admin_1.FIRESTORE_DB_NAME,
    document: `${firestore_paths_1.FirestorePaths.BOOKS}/{bookId}`
}, async (event) => {
    const snap = event.data;
    const bookData = snap.data();
    const membersMap = bookData.get(BookFields.members);
    for (const memberId of Object.keys(membersMap)) {
        try {
            const member = membersMap[memberId];
            // Get the user document from the 'users' collection
            const userRef = firebase_admin_1.firestore.collection(firestore_paths_1.FirestorePaths.USERS).doc(memberId);
            // Remove the book id from the user's 'owned_book_ids' array if the user is the owner
            // Otherwise, remove the book id from the user's 'shared_book_ids' array
            const bookIdsArr = firebase_admin_1.FieldValue.arrayRemove(event.params.bookId);
            if (member.role === BookRoles.owner) {
                await userRef.update({ owned_book_ids: bookIdsArr });
            }
            else {
                await userRef.update({ shared_book_ids: bookIdsArr });
            }
        }
        catch (error) {
            console.error(error);
        }
    }
});
//# sourceMappingURL=books.js.map