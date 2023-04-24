"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBookToMember = exports.addBookToOwner = void 0;
const functions = require("firebase-functions");
const firebase_admin_1 = require("./firebase-admin");
const firestore_paths_1 = require("./firestore-paths");
class BookFields {
}
BookFields.members = 'members';
class UserFields {
}
UserFields.ownedBookIds = 'owned_book_ids';
UserFields.sharedBookIds = 'shared_book_ids';
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
    if (!ownerId) {
        console.error('No owner found for book', bookId);
        return;
    }
    try {
        // Get the user document from the 'users' collection
        const userRef = firebase_admin_1.firestore.collection(firestore_paths_1.FirestorePaths.USERS).doc(ownerId);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            // Add the new book id to the user's 'owned_book_ids' array
            const ownedBookIds = userDoc.get(UserFields.ownedBookIds) || [];
            ownedBookIds.push(bookId);
            await userRef.update({ owned_book_ids: ownedBookIds });
        }
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
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            // Add the new book id to the user's 'shared_book_ids' array
            const sharedBookIds = userDoc.get(UserFields.sharedBookIds) || [];
            sharedBookIds.push(bookId);
            await userRef.update({ shared_book_ids: sharedBookIds });
        }
    }
    catch (error) {
        console.error(error);
    }
});
//# sourceMappingURL=books.js.map