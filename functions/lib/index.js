"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wallets = exports.transactions = exports.users = exports.books = void 0;
// Book functions
const books_1 = require("./functions/books/books");
exports.books = {
    addBookToOwner: books_1.addBookToOwner,
    addBookToMember: books_1.addBookToMember,
    deleteBookFromMembers: books_1.deleteBookFromMembers
};
// User functions
const users_1 = require("./functions/users/users");
exports.users = {
    createNewUser: users_1.createNewUser
};
// Transaction functions
const transactions_1 = require("./functions/transactions/transactions");
exports.transactions = {
    updateWalletBalanceOnNewTransaction: transactions_1.updateWalletBalanceOnNewTransaction,
    updateWalletBalanceOnTransactionUpdate: transactions_1.updateWalletBalanceOnTransactionUpdate,
    updateWalletBalanceOnTransactionDelete: transactions_1.updateWalletBalanceOnTransactionDelete
};
// Wallet functions
const wallets_1 = require("./functions/wallets/wallets");
exports.wallets = {
    createBalanceAdjustmentOnNewWallet: wallets_1.createBalanceAdjustmentOnNewWallet
};
//# sourceMappingURL=index.js.map