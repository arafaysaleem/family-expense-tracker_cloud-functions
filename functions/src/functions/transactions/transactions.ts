import * as functions from 'firebase-functions';
import { firestore } from '../../core/firebase-admin';
import { FirestorePaths } from '../../core/firestore-paths';
import TransactionType from './../../enums/transaction_type.enum';
import { handleNewBalanceTransfer, BalanceTransferTransaction } from './balance-transfer';
import { handleNewIncomeExpense, IncomeExpenseTransaction } from './income-expense';
import { AdjustmentTransaction, handleNewBalanceAdjustment } from './balance-adjustment';

export const updateWalletBalanceOnNewTransaction = functions.firestore
  .document(`${FirestorePaths.BOOKS}/{bookId}/{transactionCollectionId}/{transactionId}`)
  .onCreate(async (snap, context) => {
    const transactionData = snap.data();

    switch (transactionData.type) {
    case TransactionType.Income:
    case TransactionType.Expense:
      await handleNewIncomeExpense(transactionData as IncomeExpenseTransaction, context.params.bookId);
      break;
    case TransactionType.Transfer:
      await handleNewBalanceTransfer(transactionData as BalanceTransferTransaction, context.params.bookId);
      break;
    case TransactionType.Adjustment:
      await handleNewBalanceAdjustment(transactionData as AdjustmentTransaction, context.params.bookId);
      break;
    default:
      console.log('Transaction type is neither income, expense, transfer nor adjustment. Skipping wallet balance update.');
    }

    return null;
  });

export const updateWalletBalanceOnTransactionUpdate = functions.firestore
  .document(`${FirestorePaths.BOOKS}/{bookId}/{transactionCollectionId}/{transactionId}`)
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

export const updateWalletBalanceOnTransactionDelete = functions.firestore
  .document(`${FirestorePaths.BOOKS}/{bookId}/{transactionCollectionId}/{transactionId}`)
  .onDelete(async (snap, context) => {
    const transactionData = snap.data();

    const walletId = transactionData.wallet_id;
    const type = transactionData.type;
    const amount = transactionData.amount;

    const walletRef = firestore.doc(`${FirestorePaths.BOOKS}/${context.params.bookId}/${FirestorePaths.WALLETS}/${walletId}`);
    const walletDoc = await walletRef.get();
    const walletData = walletDoc.data()!;

    const isExpense = type === TransactionType.Expense ? 1 : -1;
    const newBalance = walletData.balance + amount * isExpense;

    await walletRef.update({ balance: newBalance });

    console.log(`Updated balance for wallet ${walletId} to ${newBalance}.`);
    return null;
  });
