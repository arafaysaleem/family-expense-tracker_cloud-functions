"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBalanceTransferDelete = exports.handleBalanceTransferUpdate = exports.handleNewBalanceTransfer = void 0;
const firebase_admin_1 = require("../../core/firebase-admin");
const firestore_paths_1 = require("../../core/firestore-paths");
const handleNewBalanceTransfer = async (transactionData, bookId) => {
    const amount = transactionData.amount;
    const srcWalletId = transactionData.src_wallet_id;
    const destWalletId = transactionData.dest_wallet_id;
    const srcWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${srcWalletId}`);
    const destWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${destWalletId}`);
    const newSrcBalance = firebase_admin_1.FieldValue.increment(-amount);
    const newDestBalance = firebase_admin_1.FieldValue.increment(amount);
    await Promise.all([
        srcWalletRef.update({ balance: newSrcBalance }),
        destWalletRef.update({ balance: newDestBalance })
    ]);
    console.log(`Updated balance for src wallet ${srcWalletId} to ${newSrcBalance} and dest wallet ${destWalletId} to ${newDestBalance}.`);
};
exports.handleNewBalanceTransfer = handleNewBalanceTransfer;
const handleBalanceTransferUpdate = async (transactionBefore, transactionAfter, bookId) => {
    const { amount: oldAmount, src_wallet_id: oldSrcWalletId, dest_wallet_id: oldDestWalletId } = transactionBefore;
    const { amount: newAmount, src_wallet_id: newSrcWalletId, dest_wallet_id: newDestWalletId } = transactionAfter;
    if (oldSrcWalletId !== newSrcWalletId) {
        console.log('Src wallet changed, updating old and new src wallet balances');
        // if the src wallet has changed, update old and new src wallets
        const oldSrcWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${oldSrcWalletId}`);
        const newSrcWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${newSrcWalletId}`);
        await Promise.all([
            oldSrcWalletRef.update({ balance: firebase_admin_1.FieldValue.increment(oldAmount) }),
            newSrcWalletRef.update({ balance: firebase_admin_1.FieldValue.increment(-newAmount) })
        ]);
    }
    else if (oldAmount !== newAmount) {
        console.log('Amount changed, updating src wallet balance');
        const oldSrcWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${oldSrcWalletId}`);
        const diff = newAmount - oldAmount;
        await oldSrcWalletRef.update({ balance: firebase_admin_1.FieldValue.increment(-diff) });
    }
    if (oldDestWalletId !== newDestWalletId) {
        console.log('Dest wallet changed, updating old and new dest wallet balances');
        // if the dest wallet has changed, update old and new dest wallets
        const oldDestWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${oldDestWalletId}`);
        const newDestWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${newDestWalletId}`);
        await Promise.all([
            oldDestWalletRef.update({ balance: firebase_admin_1.FieldValue.increment(-oldAmount) }),
            newDestWalletRef.update({ balance: firebase_admin_1.FieldValue.increment(newAmount) })
        ]);
    }
    else if (oldAmount !== newAmount) {
        console.log('Amount changed, updating dest wallet balance');
        const oldDestWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${oldDestWalletId}`);
        const diff = newAmount - oldAmount;
        await oldDestWalletRef.update({ balance: firebase_admin_1.FieldValue.increment(diff) });
    }
};
exports.handleBalanceTransferUpdate = handleBalanceTransferUpdate;
const handleBalanceTransferDelete = async (transactionData, bookId) => {
    const srcWalletId = transactionData.src_wallet_id;
    const destWalletId = transactionData.dest_wallet_id;
    const amount = transactionData.amount;
    const srcWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${srcWalletId}`);
    const newSrcBalance = firebase_admin_1.FieldValue.increment(amount);
    const destWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${destWalletId}`);
    const newDestBalance = firebase_admin_1.FieldValue.increment(-amount);
    await Promise.all([
        srcWalletRef.update({ balance: newSrcBalance }),
        destWalletRef.update({ balance: newDestBalance })
    ]);
    console.log(`Updated balance for wallet ${srcWalletId} to ${newSrcBalance}.`);
    console.log(`Updated balance for wallet ${destWalletId} to ${newDestBalance}.`);
};
exports.handleBalanceTransferDelete = handleBalanceTransferDelete;
//# sourceMappingURL=balance-transfer.js.map