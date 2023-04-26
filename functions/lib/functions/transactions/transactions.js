"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWalletBalanceOnTransactionDelete = exports.updateWalletBalanceOnTransactionUpdate = exports.updateWalletBalanceOnNewTransaction = void 0;
const functions = require("firebase-functions");
const firebase_admin_1 = require("../../core/firebase-admin");
const firestore_paths_1 = require("../../core/firestore-paths");
const transaction_type_enum_1 = require("./../../enums/transaction_type.enum");
const balance_transfer_1 = require("./balance-transfer");
const income_expense_1 = require("./income-expense");
const balance_adjustment_1 = require("./balance-adjustment");
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
            console.log('Transaction type is neither income, expense, transfer nor adjustment. Skipping wallet balance update.');
    }
    return null;
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
    const walletId = transactionData.wallet_id;
    const type = transactionData.type;
    const amount = transactionData.amount;
    const walletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${context.params.bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${walletId}`);
    const walletDoc = await walletRef.get();
    const walletData = walletDoc.data();
    const isExpense = type === transaction_type_enum_1.default.Expense ? 1 : -1;
    const newBalance = walletData.balance + amount * isExpense;
    await walletRef.update({ balance: newBalance });
    console.log(`Updated balance for wallet ${walletId} to ${newBalance}.`);
});
//# sourceMappingURL=transactions.js.map