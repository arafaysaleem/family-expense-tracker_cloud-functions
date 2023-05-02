"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBalanceAdjustmentDelete = exports.handleNewBalanceAdjustment = void 0;
const firebase_admin_1 = require("../../core/firebase-admin");
const firestore_paths_1 = require("../../core/firestore-paths");
const handleNewBalanceAdjustment = async (transactionData, bookId) => {
    const walletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${transactionData.wallet_id}`);
    const newBalance = transactionData.amount;
    await walletRef.update({ balance: newBalance });
    console.log(`Updated balance for wallet ${transactionData.wallet_id} to ${newBalance}.`);
};
exports.handleNewBalanceAdjustment = handleNewBalanceAdjustment;
const handleBalanceAdjustmentDelete = async (transactionData, bookId) => {
    const walletId = transactionData.wallet_id;
    const nowAmount = transactionData.amount;
    const previousAmount = transactionData.previous_amount;
    const walletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${walletId}`);
    const diff = nowAmount - previousAmount;
    const newBalance = firebase_admin_1.FieldValue.increment(-diff);
    await walletRef.update({ balance: newBalance });
    console.log(`Updated balance for wallet ${walletId} to ${newBalance}.`);
};
exports.handleBalanceAdjustmentDelete = handleBalanceAdjustmentDelete;
//# sourceMappingURL=balance-adjustment.js.map