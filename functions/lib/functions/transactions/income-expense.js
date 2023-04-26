"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIncomeExpenseUpdate = exports.handleNewIncomeExpense = void 0;
const firebase_admin_1 = require("../../core/firebase-admin");
const firestore_paths_1 = require("../../core/firestore-paths");
const transaction_type_enum_1 = require("../../enums/transaction_type.enum");
const handleNewIncomeExpense = async (transactionData, bookId) => {
    const walletId = transactionData.wallet_id;
    const type = transactionData.type;
    const amount = transactionData.amount;
    const walletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${walletId}`);
    const walletDoc = await walletRef.get();
    const walletData = walletDoc.data();
    const isIncome = type === transaction_type_enum_1.default.Income ? 1 : -1;
    const newBalance = walletData.balance + amount * isIncome;
    await walletRef.update({ balance: newBalance });
    console.log(`Updated balance for wallet ${walletId} to ${newBalance}.`);
};
exports.handleNewIncomeExpense = handleNewIncomeExpense;
const handleIncomeExpenseUpdate = async (transactionBefore, transactionAfter, bookId) => {
    const walletId = transactionBefore.wallet_id;
    const typeBefore = transactionBefore.type;
    const typeAfter = transactionAfter.type;
    const amountBefore = transactionBefore.amount;
    const amountAfter = transactionAfter.amount;
    const isIncome = typeAfter === transaction_type_enum_1.default.Income ? 1 : -1;
    const typeChanged = typeAfter !== typeBefore ? 1 : -1;
    const walletRef = firebase_admin_1.firestore.doc(`books/${bookId}`);
    const walletData = (await walletRef.get()).data();
    const newAmount = amountAfter + amountBefore * typeChanged;
    const newBalance = walletData.balance + newAmount * isIncome;
    await walletRef.update({ balance: newBalance });
    console.log(`Updated balance for wallet ${walletId} to ${newBalance}.`);
};
exports.handleIncomeExpenseUpdate = handleIncomeExpenseUpdate;
//# sourceMappingURL=income-expense.js.map