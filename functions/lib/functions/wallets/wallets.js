"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBalanceAdjustmentOnNewWallet = void 0;
const functions = require("firebase-functions");
const firestore_paths_1 = require("../../core/firestore-paths");
const transaction_type_enum_1 = require("../../enums/transaction_type.enum");
const transactions_1 = require("../transactions/transactions");
exports.createBalanceAdjustmentOnNewWallet = functions.firestore
    .document(`${firestore_paths_1.FirestorePaths.BOOKS}/{bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/{walletId}`)
    .onCreate(async (snap, context) => {
    const walletData = snap.data();
    const adjustmentTransaction = {
        type: transaction_type_enum_1.default.Adjustment,
        amount: walletData.balance,
        previous_amount: 0,
        wallet_id: walletData.id,
        date: new Date()
    };
    await (0, transactions_1.createNewTransaction)(adjustmentTransaction, context.params.bookId);
});
//# sourceMappingURL=wallets.js.map