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
    const srcWalletData = (await srcWalletRef.get()).data();
    const destWalletData = (await destWalletRef.get()).data();
    const newSrcBalance = srcWalletData.balance - amount;
    const newDestBalance = destWalletData.balance + amount;
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
        const oldSrcWalletData = (await oldSrcWalletRef.get()).data();
        const newSrcWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${newSrcWalletId}`);
        const newSrcWalletData = (await newSrcWalletRef.get()).data();
        await Promise.all([
            oldSrcWalletRef.update({ balance: oldSrcWalletData.balance + oldAmount }),
            newSrcWalletRef.update({ balance: newSrcWalletData.balance - newAmount })
        ]);
    }
    else if (oldAmount !== newAmount) {
        console.log('Amount changed, updating src wallet balance');
        const oldSrcWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${oldSrcWalletId}`);
        const oldSrcWalletData = (await oldSrcWalletRef.get()).data();
        await oldSrcWalletRef.update({ balance: oldSrcWalletData.balance - (newAmount - oldAmount) });
    }
    if (oldDestWalletId !== newDestWalletId) {
        console.log('Dest wallet changed, updating old and new dest wallet balances');
        // if the dest wallet has changed, update old and new dest wallets
        const oldDestWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${oldDestWalletId}`);
        const newDestWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${newDestWalletId}`);
        const oldDestWalletData = (await oldDestWalletRef.get()).data();
        const newDestWalletData = (await newDestWalletRef.get()).data();
        await Promise.all([
            oldDestWalletRef.update({ balance: oldDestWalletData.balance - oldAmount }),
            newDestWalletRef.update({ balance: newDestWalletData.balance + newAmount })
        ]);
    }
    else if (oldAmount !== newAmount) {
        console.log('Amount changed, updating dest wallet balance');
        const oldDestWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${oldDestWalletId}`);
        const oldDestWalletData = (await oldDestWalletRef.get()).data();
        await oldDestWalletRef.update({ balance: oldDestWalletData.balance + (newAmount - oldAmount) });
    }
};
exports.handleBalanceTransferUpdate = handleBalanceTransferUpdate;
const handleBalanceTransferDelete = async (transactionData, bookId) => {
    const srcWalletId = transactionData.src_wallet_id;
    const destWalletId = transactionData.dest_wallet_id;
    const amount = transactionData.amount;
    const srcWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${srcWalletId}`);
    const srcWalletData = (await srcWalletRef.get()).data();
    const newSrcBalance = srcWalletData.balance + amount;
    const destWalletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${destWalletId}`);
    const destWalletData = (await destWalletRef.get()).data();
    const newDestBalance = destWalletData.balance - amount;
    await Promise.all([
        srcWalletRef.update({ balance: newSrcBalance }),
        destWalletRef.update({ balance: newDestBalance })
    ]);
    console.log(`Updated balance for wallet ${srcWalletId} to ${newSrcBalance}.`);
    console.log(`Updated balance for wallet ${destWalletId} to ${newDestBalance}.`);
};
exports.handleBalanceTransferDelete = handleBalanceTransferDelete;
//# sourceMappingURL=balance-transfer.js.map