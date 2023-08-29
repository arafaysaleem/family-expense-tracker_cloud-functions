"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWalletBalanceOnTransactionDelete = exports.updateWalletBalanceOnTransactionUpdate = exports.updateWalletBalanceOnNewTransaction = exports.createNewTransaction = void 0;
const functions = require("firebase-functions");
const firestore_paths_1 = require("../../core/firestore-paths");
const transaction_type_enum_1 = require("./../../enums/transaction_type.enum");
const balance_transfer_1 = require("./balance-transfer");
const income_expense_1 = require("./income-expense");
const balance_adjustment_1 = require("./balance-adjustment");
const createNewTransaction = async (transactionData, bookId) => {
    switch (transactionData.type) {
        case transaction_type_enum_1.default.Adjustment:
            await (0, balance_adjustment_1.createNewBalanceAdjustment)(transactionData, bookId);
            break;
        case transaction_type_enum_1.default.Income:
        case transaction_type_enum_1.default.Expense:
        case transaction_type_enum_1.default.Transfer:
            console.log('Creating transactions for income, expense or transfer is not implemented yet.');
            break;
        default:
            console.log('Transaction type is neither income, expense, transfer nor adjustment. Skipping transaction create.');
    }
};
exports.createNewTransaction = createNewTransaction;
exports.updateWalletBalanceOnNewTransaction = functions.firestore
    .document(`${firestore_paths_1.FirestorePaths.BOOKS}/{bookId}/{transactionCollectionId}/{transactionId}`)
    .onCreate(async (snap, context) => {
    const transactionData = snap.data();
    switch (transactionData.type) {
        case transaction_type_enum_1.default.Income:
        case transaction_type_enum_1.default.Expense:
            await (0, income_expense_1.handleNewIncomeExpense)(transactionData, context.params.bookId);
            break;
        case transaction_type_enum_1.default.Transfer:
            await (0, balance_transfer_1.handleNewBalanceTransfer)(transactionData, context.params.bookId);
            break;
        case transaction_type_enum_1.default.Adjustment:
            await (0, balance_adjustment_1.handleNewBalanceAdjustment)(transactionData, context.params.bookId);
            break;
        default:
            console.log('Transaction type is not income, expense, transfer or adjustment. Skipping wallet balance update.');
    }
});
exports.updateWalletBalanceOnTransactionUpdate = functions.firestore
    .document(`${firestore_paths_1.FirestorePaths.BOOKS}/{bookId}/{transactionCollectionId}/{transactionId}`)
    .onUpdate(async (change, context) => {
    const transactionBefore = change.before.data();
    const transactionAfter = change.after.data();
    if (transactionAfter.type === transaction_type_enum_1.default.Income || transactionAfter.type === transaction_type_enum_1.default.Expense) {
        await (0, income_expense_1.handleIncomeExpenseUpdate)(transactionBefore, transactionAfter, context.params.bookId);
    }
    else if (transactionAfter.type === transaction_type_enum_1.default.Transfer) {
        await (0, balance_transfer_1.handleBalanceTransferUpdate)(transactionBefore, transactionAfter, context.params.bookId);
    }
});
exports.updateWalletBalanceOnTransactionDelete = functions.firestore
    .document(`${firestore_paths_1.FirestorePaths.BOOKS}/{bookId}/{transactionCollectionId}/{transactionId}`)
    .onDelete(async (snap, context) => {
    const transactionData = snap.data();
    switch (transactionData.type) {
        case transaction_type_enum_1.default.Income:
        case transaction_type_enum_1.default.Expense:
            await (0, income_expense_1.handleIncomeExpenseDelete)(transactionData, context.params.bookId);
            break;
        case transaction_type_enum_1.default.Transfer:
            await (0, balance_transfer_1.handleBalanceTransferDelete)(transactionData, context.params.bookId);
            break;
        case transaction_type_enum_1.default.Adjustment:
            await (0, balance_adjustment_1.handleBalanceAdjustmentDelete)(transactionData, context.params.bookId);
            break;
        default:
            console.log('Transaction type is neither income, expense, transfer nor adjustment. Skipping wallet balance update.');
    }
});
//# sourceMappingURL=transactions.js.map