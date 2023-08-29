"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBalanceAdjustmentDelete = exports.handleNewBalanceAdjustment = exports.createNewBalanceAdjustment = void 0;
const firebase_admin_1 = require("../../core/firebase-admin");
const firestore_paths_1 = require("../../core/firestore-paths");
const uuid_1 = require("uuid");
const utils_1 = require("../../utils/utils");
const createNewBalanceAdjustment = async (transactionData, bookId) => {
    const transMonth = transactionData.date.getMonth() + 1; // starts from 0
    const transYear = transactionData.date.getFullYear();
    const transCollectionId = `${firestore_paths_1.FirestorePaths.TRANSACTIONS}-${transMonth}-${transYear}`;
    const transRef = firebase_admin_1.firestore.collection(firestore_paths_1.FirestorePaths.BOOKS).doc(bookId).collection(transCollectionId);
    const id = (0, uuid_1.v4)();
    const { date: transDate } = transactionData, rest = __rest(transactionData, ["date"]);
    const transactionDataWithDate = Object.assign({ id: id, date: (0, utils_1.formatDateToISO)(transDate) }, rest);
    await transRef.doc(id).set(transactionDataWithDate);
    const newBalance = transactionData.amount;
    console.log(`Added adjustment transaction for new wallet ${transactionData.wallet_id} to ${newBalance}.`);
};
exports.createNewBalanceAdjustment = createNewBalanceAdjustment;
const handleNewBalanceAdjustment = async (transactionData, bookId) => {
    const walletRef = firebase_admin_1.firestore.doc(`${firestore_paths_1.FirestorePaths.BOOKS}/${bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/${transactionData.wallet_id}`);
    const newBalance = transactionData.amount;
    await walletRef.update({ balance: newBalance });
    console.log(`Adjusted balance for wallet ${transactionData.wallet_id} to ${newBalance}.`);
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
    console.log(`Adjusted balance for wallet ${walletId} to ${newBalance}.`);
};
exports.handleBalanceAdjustmentDelete = handleBalanceAdjustmentDelete;
//# sourceMappingURL=balance-adjustment.js.map