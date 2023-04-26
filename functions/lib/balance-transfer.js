"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNewBalanceTransfer = void 0;
const firebase_admin_1 = require("./firebase-admin");
const firestore_paths_1 = require("./firestore-paths");
const handleNewBalanceTransfer = async (transactionData, bookId) => {
    const amount = transactionData.amount;
    const srcWalletId = transactionData.src_wallet_id;
    const destWalletId = transactionData.dest_wallet_id;
    const srcWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${srcWalletId}`);
    const destWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${destWalletId}`);
    const srcWalletData = (await srcWalletRef.get()).data();
    const destWalletData = (await destWalletRef.get()).data();
    const newSrcBalance = srcWalletData.balance - amount;
    const newDestBalance = destWalletData.balance + amount;
    await srcWalletRef.update({ balance: newSrcBalance });
    await destWalletRef.update({ balance: newDestBalance });
    console.log(`Updated balance for src wallet ${srcWalletId} to ${newSrcBalance} and dest wallet ${destWalletId} to ${newDestBalance}.`);
};
exports.handleNewBalanceTransfer = handleNewBalanceTransfer;
//# sourceMappingURL=balance-transfer.js.map