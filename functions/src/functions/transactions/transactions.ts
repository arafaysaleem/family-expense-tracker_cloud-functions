import * as functions from 'firebase-functions';
import { FirestorePaths } from '../../core/firestore-paths';
import TransactionType from './../../enums/transaction_type.enum';
import { handleNewBalanceTransfer, BalanceTransferTransaction, handleBalanceTransferUpdate, handleBalanceTransferDelete } from './balance-transfer';
import { handleIncomeExpenseDelete, handleIncomeExpenseUpdate, handleNewIncomeExpense, IncomeExpenseTransaction } from './income-expense';
import { AdjustmentTransaction, handleBalanceAdjustmentDelete, handleNewBalanceAdjustment } from './balance-adjustment';

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
  });

export const updateWalletBalanceOnTransactionUpdate = functions.firestore
  .document(`${FirestorePaths.BOOKS}/{bookId}/{transactionCollectionId}/{transactionId}`)
  .onUpdate(async (change, context) => {
    const transactionBefore = change.before.data();
    const transactionAfter = change.after.data();

    if (transactionAfter.type === TransactionType.Income || transactionAfter.type === TransactionType.Expense) {
      await handleIncomeExpenseUpdate(
        transactionBefore as IncomeExpenseTransaction,
        transactionAfter as IncomeExpenseTransaction,
        context.params.bookId
      );
    } else if (transactionAfter.type === TransactionType.Transfer) {
      await handleBalanceTransferUpdate(
        transactionBefore as BalanceTransferTransaction,
        transactionAfter as BalanceTransferTransaction,
        context.params.bookId
      );
    }
  });

export const updateWalletBalanceOnTransactionDelete = functions.firestore
  .document(`${FirestorePaths.BOOKS}/{bookId}/{transactionCollectionId}/{transactionId}`)
  .onDelete(async (snap, context) => {
    const transactionData = snap.data();

    switch (transactionData.type) {
    case TransactionType.Income:
    case TransactionType.Expense:
      await handleIncomeExpenseDelete(transactionData as IncomeExpenseTransaction, context.params.bookId);
      break;
    case TransactionType.Transfer:
      await handleBalanceTransferDelete(transactionData as BalanceTransferTransaction, context.params.bookId);
      break;
    case TransactionType.Adjustment:
      await handleBalanceAdjustmentDelete(transactionData as AdjustmentTransaction, context.params.bookId);
      break;
    default:
      console.log('Transaction type is neither income, expense, transfer nor adjustment. Skipping wallet balance update.');
    }
  });
