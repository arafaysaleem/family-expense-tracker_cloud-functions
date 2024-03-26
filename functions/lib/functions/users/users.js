"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserImageAcrossBooks = exports.createNewUser = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_admin_1 = require("../../core/firebase-admin");
const firestore_paths_1 = require("../../core/firestore-paths");
const firestore_1 = require("firebase-functions/v2/firestore");
const books_1 = require("../books/books");
class UserFields {
}
UserFields.image_url = 'image_url';
exports.createNewUser = functions.auth
    .user()
    .onCreate(async (user) => {
    const { uid, displayName, email, photoURL } = user;
    try {
        // Create a new document with the user id as the document id
        const userRef = firebase_admin_1.firestore.collection(firestore_paths_1.FirestorePaths.USERS).doc(uid);
        // // Create a new default book
        // const bookId: string = uuidv4();
        // Set the fields of the new document
        await userRef.set({
            uid,
            displayName,
            email,
            image_url: photoURL,
            owned_book_ids: [],
            // owned_book_ids: [bookId],
            shared_book_ids: []
        });
        // const booksRef = firestore.collection(FirestorePaths.BOOKS).doc(bookId);
        // await booksRef.set({
        //   id: bookId,
        //   name: 'Household Financials',
        //   currency_name: 'USD',
        //   color: '#0047E0',
        //   icon_key: 'bookOpen',
        //   is_enabled: true,
        //   description: 'For collaborating on family finances',
        //   members: {
        //     [uid]: {
        //       role: 'owner',
        //       image_url: photoURL
        //     }
        //   }
        // });
    }
    catch (error) {
        console.error(error);
    }
});
exports.updateUserImageAcrossBooks = (0, firestore_1.onDocumentUpdated)(`${firestore_paths_1.FirestorePaths.USERS}/{userId}`, async (event) => {
    const change = event.data;
    const newUser = change.after.data();
    const imageUrlBefore = change.before.get(UserFields.image_url);
    // If the image url hasn't changed, do nothing
    if (imageUrlBefore === newUser.image_url)
        return;
    // Get the all the owned and shared books of the user
    const books = [...newUser.owned_book_ids, ...newUser.shared_book_ids];
    // Replace the image url from each of their members map
    try {
        const batch = firebase_admin_1.firestore.batch();
        books.forEach((bookId) => {
            const bookRef = firebase_admin_1.firestore.collection(firestore_paths_1.FirestorePaths.BOOKS).doc(bookId);
            const imageFieldRef = `${books_1.BookFields.members}.${newUser.uid}.${UserFields.image_url}`;
            batch.update(bookRef, { [imageFieldRef]: newUser.image_url });
        });
        await batch.commit();
    }
    catch (error) {
        console.error(error);
    }
});
//# sourceMappingURL=users.js.map