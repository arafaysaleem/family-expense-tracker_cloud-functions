"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNewBalanceAdjustment = void 0;
const firebase_admin_1 = require("../../core/firebase-admin");
const firestore_paths_1 = require("../../core/firestore-paths");
const handleNewBalanceAdjustment = async (transactionData, bookId) => {
    const walletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${transactionData.wallet_id}`);
    const newBalance = transactionData.amount;
    await walletRef.update({ balance: newBalance });
    console.log(`Updated balance for wallet ${transactionData.wallet_id} to ${newBalance}.`);
};
exports.handleNewBalanceAdjustment = handleNewBalanceAdjustment;
//# sourceMappingURL=balance-adjustment.js.map