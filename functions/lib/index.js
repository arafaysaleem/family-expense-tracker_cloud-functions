"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactions = exports.users = exports.books = void 0;
const books_1 = require("./functions/books/books");
exports.books = {
    addBookToOwner: books_1.addBookToOwner,
    addBookToMember: books_1.addBookToMember
};
const users_1 = require("./functions/users/users");
exports.users = {
    createNewUser: users_1.createNewUser
};
const transactions_1 = require("./functions/transactions/transactions");
exports.transactions = {
    updateWalletBalanceOnNewTransaction: transactions_1.updateWalletBalanceOnNewTransaction,
    updateWalletBalanceOnTransactionUpdate: transactions_1.updateWalletBalanceOnTransactionUpdate,
    updateWalletBalanceOnTransactionDelete: transactions_1.updateWalletBalanceOnTransactionDelete
};
//# sourceMappingURL=index.js.map