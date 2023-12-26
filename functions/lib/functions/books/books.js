"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBookFromMembers = exports.setupNewBookDefaults = void 0;
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
exports.setupNewBookDefaults = (0, firestore_1.onDocumentCreated)(`${firestore_paths_1.FirestorePaths.BOOKS}/{bookId}`, async (event) => {
    const snapshot = event.data;
    const bookId = snapshot.id;
    try {
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
exports.deleteBookFromMembers = (0, firestore_1.onDocumentDeleted)(`${firestore_paths_1.FirestorePaths.BOOKS}/{bookId}`, async (event) => {
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