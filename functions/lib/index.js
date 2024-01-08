"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = exports.books = void 0;
// Book functions
const books_1 = require("./functions/books/books");
exports.books = {
    setupNewBookDefaults: books_1.setupNewBookDefaults,
    deleteBookFromMembers: books_1.deleteBookFromMembers
};
// User functions
const users_1 = require("./functions/users/users");
exports.users = {
    createNewUser: users_1.createNewUser
};
//# sourceMappingURL=index.js.map