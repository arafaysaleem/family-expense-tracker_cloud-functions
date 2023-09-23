"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWalletBalanceOnTransactionDelete = exports.updateWalletBalanceOnTransactionUpdate = exports.updateWalletBalanceOnNewTransaction = exports.createNewTransaction = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_paths_1 = require("../../core/firestore-paths");
const transaction_type_enum_1 = require("./../../enums/transaction_type.enum");
const balance_transfer_1 = require("./balance-transfer");
const income_expense_1 = require("./income-expense");
const balance_adjustment_1 = require("./balance-adjustment");
const firebase_admin_1 = require("../../core/firebase-admin");
const createNewTransaction = async (transactionData, bookId) => {
    switch (transactionData.type) {
        case transaction_type_enum_1.TransactionType.Adjustment:
            await (0, balance_adjustment_1.createNewBalanceAdjustment)(transactionData, bookId);
            break;
        case transaction_type_enum_1.TransactionType.Income:
        case transaction_type_enum_1.TransactionType.Expense:
        case transaction_type_enum_1.TransactionType.Transfer:
            console.log('Creating transactions for income, expense or transfer is not implemented yet.');
            break;
        default:
            console.log('Transaction type is neither income, expense, transfer nor adjustment. Skipping transaction create.');
    }
};
exports.createNewTransaction = createNewTransaction;
exports.updateWalletBalanceOnNewTransaction = (0, firestore_1.onDocumentCreated)({
    database: firebase_admin_1.FIRESTORE_DB_NAME,
    document: `${firestore_paths_1.FirestorePaths.BOOKS}/{bookId}/{transactionCollectionId}/{transactionId}`
}, async (event) => {
    const transactionData = event.data.data();
    switch (transactionData.type) {
        case transaction_type_enum_1.TransactionType.Income:
        case transaction_type_enum_1.TransactionType.Expense:
            await (0, income_expense_1.handleNewIncomeExpense)(transactionData, event.params.bookId);
            break;
        case transaction_type_enum_1.TransactionType.Transfer:
            await (0, balance_transfer_1.handleNewBalanceTransfer)(transactionData, event.params.bookId);
            break;
        case transaction_type_enum_1.TransactionType.Adjustment:
            await (0, balance_adjustment_1.handleNewBalanceAdjustment)(transactionData, event.params.bookId);
            break;
        default:
            console.log('Transaction type is not income, expense, transfer or adjustment. Skipping wallet balance update.');
    }
});
exports.updateWalletBalanceOnTransactionUpdate = (0, firestore_1.onDocumentUpdated)({
    database: firebase_admin_1.FIRESTORE_DB_NAME,
    document: `${firestore_paths_1.FirestorePaths.BOOKS}/{bookId}/{transactionCollectionId}/{transactionId}`
}, async (event) => {
    const transactionBefore = event.data.before.data();
    const transactionAfter = event.data.after.data();
    if (transactionAfter.type === transaction_type_enum_1.TransactionType.Income || transactionAfter.type === transaction_type_enum_1.TransactionType.Expense) {
        await (0, income_expense_1.handleIncomeExpenseUpdate)(transactionBefore, transactionAfter, event.params.bookId);
    }
    else if (transactionAfter.type === transaction_type_enum_1.TransactionType.Transfer) {
        await (0, balance_transfer_1.handleBalanceTransferUpdate)(transactionBefore, transactionAfter, event.params.bookId);
    }
});
exports.updateWalletBalanceOnTransactionDelete = (0, firestore_1.onDocumentDeleted)({
    database: firebase_admin_1.FIRESTORE_DB_NAME,
    document: `${firestore_paths_1.FirestorePaths.BOOKS}/{bookId}/{transactionCollectionId}/{transactionId}`
}, async (event) => {
    const transactionData = event.data.data();
    switch (transactionData.type) {
        case transaction_type_enum_1.TransactionType.Income:
        case transaction_type_enum_1.TransactionType.Expense:
            await (0, income_expense_1.handleIncomeExpenseDelete)(transactionData, event.params.bookId);
            break;
        case transaction_type_enum_1.TransactionType.Transfer:
            await (0, balance_transfer_1.handleBalanceTransferDelete)(transactionData, event.params.bookId);
            break;
        case transaction_type_enum_1.TransactionType.Adjustment:
            await (0, balance_adjustment_1.handleBalanceAdjustmentDelete)(transactionData, event.params.bookId);
            break;
        default:
            console.log('Transaction type is neither income, expense, transfer nor adjustment. Skipping wallet balance update.');
    }
});
//# sourceMappingURL=transactions.js.map