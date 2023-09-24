"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBalanceAdjustmentOnNewWallet = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_paths_1 = require("../../core/firestore-paths");
const transaction_type_enum_1 = require("../../enums/transaction_type.enum");
const transactions_1 = require("../transactions/transactions");
exports.createBalanceAdjustmentOnNewWallet = (0, firestore_1.onDocumentCreated)(`${firestore_paths_1.FirestorePaths.BOOKS}/{bookId}/${firestore_paths_1.FirestorePaths.WALLETS}/{walletId}`, async (event) => {
    const snap = event.data;
    const walletData = snap.data();
    // usually for default wallets, bcz user can't create wallet with 0 balance
    if (walletData.balance === 0)
        return;
    const adjustmentTransaction = {
        type: transaction_type_enum_1.TransactionType.Adjustment,
        amount: walletData.balance,
        previous_amount: 0,
        wallet_id: walletData.id,
        date: new Date()
    };
    await (0, transactions_1.createNewTransaction)(adjustmentTransaction, event.params.bookId);
});
//# sourceMappingURL=wallets.js.map