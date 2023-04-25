import * as functions from 'firebase-functions';
import { firestore } from './firebase-admin';
import { FirestorePaths } from './firestore-paths';

enum TransactionType {
    Income = 'income',
    Expense = 'expense',
}

export const updateWalletBalanceOnNewTransaction = functions.firestore
  .document(`${FirestorePaths.BOOKS}/{bookId}/${FirestorePaths.TRANSACTIONS}-*`)
  .onCreate(async (snap, context) => {
    const transactionData = snap.data();

    if (transactionData.type !== TransactionType.Income && transactionData.type !== TransactionType.Expense) {
      console.log('Transaction type is neither income nor expense. Skipping wallet balance update.');
      return null;
    }

    const walletId = transactionData.wallet_id;
    const type = transactionData.type;
    const amount = transactionData.amount;

    const walletRef = firestore.doc(`${FirestorePaths.BOOKS}/${context.params.bookId}/${FirestorePaths.WALLETS}/${walletId}`);
    const walletDoc = await walletRef.get();
    const walletData = walletDoc.data()!;

    const isIncome = type === TransactionType.Income ? 1 : -1;
    const newBalance = walletData.balance + amount * isIncome;

    await walletRef.update({ balance: newBalance });

    console.log(`Updated balance for wallet ${walletId} to ${newBalance}.`);
    return null;
  });

export const updateWalletBalanceOnTransactionUpdate = functions.firestore
  .document(`${FirestorePaths.BOOKS}/{bookId}/${FirestorePaths.TRANSACTIONS}-{month}-{year}/{transactionId}`)
  .onUpdate(async (change, context) => {
    const transactionBefore = change.before.data();
    const transactionAfter = change.after.data();

    const walletId = transactionBefore.wallet_id;
    const typeBefore = transactionBefore.type;
    const typeAfter = transactionAfter.type;
    const amountBefore = transactionBefore.amount;
    const amountAfter = transactionAfter.amount;

    const isIncome = typeAfter === TransactionType.Income ? 1 : -1;
    const typeChanged = typeAfter !== typeBefore ? 1 : -1;

    const walletRef = firestore.doc(`books/${context.params.bookId}`);
    const walletDoc = await walletRef.get();

    const walletData = walletDoc.data()!;

    const newAmount = amountAfter + amountBefore * typeChanged;
    const newBalance = walletData.balance + newAmount * isIncome;

    await walletRef.update({ balance: newBalance });

    console.log(`Updated balance for wallet ${walletId} to ${newBalance}.`);
    return null;
  });

