import { onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { FirestorePaths } from '../../core/firestore-paths';
import { TransactionType } from './../../enums/transaction_type.enum';
import { BalanceTransferTransaction, handleBalanceTransferUpdate, handleBalanceTransferDelete } from './balance-transfer';
import { handleIncomeExpenseDelete, handleIncomeExpenseUpdate, IncomeExpenseTransaction } from './income-expense';
import { AdjustmentTransaction, handleBalanceAdjustmentDelete } from './balance-adjustment';

export const updateWalletBalanceOnTransactionUpdate = onDocumentUpdated(
  `${FirestorePaths.BOOKS}/{bookId}/{transactionCollectionId}/{transactionId}`,
  async (event) => {
    const transactionBefore = event.data!.before.data();
    const transactionAfter = event.data!.after.data();

    if (transactionAfter.type === TransactionType.Income || transactionAfter.type === TransactionType.Expense) {
      await handleIncomeExpenseUpdate(
        transactionBefore as IncomeExpenseTransaction,
        transactionAfter as IncomeExpenseTransaction,
        event.params.bookId
      );
    } else if (transactionAfter.type === TransactionType.Transfer) {
      await handleBalanceTransferUpdate(
        transactionBefore as BalanceTransferTransaction,
        transactionAfter as BalanceTransferTransaction,
        event.params.bookId
      );
    }
  }
);

export const updateWalletBalanceOnTransactionDelete = onDocumentDeleted(
  `${FirestorePaths.BOOKS}/{bookId}/{transactionCollectionId}/{transactionId}`,
  async (event) => {
    const transactionData = event.data!.data();

    switch (transactionData.type) {
    case TransactionType.Income:
    case TransactionType.Expense:
      await handleIncomeExpenseDelete(transactionData as IncomeExpenseTransaction, event.params.bookId);
      break;
    case TransactionType.Transfer:
      await handleBalanceTransferDelete(transactionData as BalanceTransferTransaction, event.params.bookId);
      break;
    case TransactionType.Adjustment:
      await handleBalanceAdjustmentDelete(transactionData as AdjustmentTransaction, event.params.bookId);
      break;
    default:
      console.log('Transaction type is neither income, expense, transfer nor adjustment. Skipping wallet balance update.');
    }
  }
);
