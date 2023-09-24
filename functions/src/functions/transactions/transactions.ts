import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { FirestorePaths } from '../../core/firestore-paths';
import { TransactionType } from './../../enums/transaction_type.enum';
import { handleNewBalanceTransfer, BalanceTransferTransaction, handleBalanceTransferUpdate, handleBalanceTransferDelete } from './balance-transfer';
import { handleIncomeExpenseDelete, handleIncomeExpenseUpdate, handleNewIncomeExpense, IncomeExpenseTransaction } from './income-expense';
import { AdjustmentTransaction, handleBalanceAdjustmentDelete, handleNewBalanceAdjustment, createNewBalanceAdjustment } from './balance-adjustment';

export const createNewTransaction = async (
  transactionData: IncomeExpenseTransaction | BalanceTransferTransaction | AdjustmentTransaction,
  bookId: string
): Promise<void> => {
  switch (transactionData.type) {
  case TransactionType.Adjustment:
    await createNewBalanceAdjustment(transactionData as AdjustmentTransaction, bookId);
    break;
  case TransactionType.Income:
  case TransactionType.Expense:
  case TransactionType.Transfer:
    console.log('Creating transactions for income, expense or transfer is not implemented yet.');
    break;
  default:
    console.log('Transaction type is neither income, expense, transfer nor adjustment. Skipping transaction create.');
  }
};

export const updateWalletBalanceOnNewTransaction = onDocumentCreated(
  `${FirestorePaths.BOOKS}/{bookId}/{transactionCollectionId}/{transactionId}`,
  async (event) => {
    const transactionData = event.data!.data();

    switch (transactionData.type) {
    case TransactionType.Income:
    case TransactionType.Expense:
      await handleNewIncomeExpense(transactionData as IncomeExpenseTransaction, event.params.bookId);
      break;
    case TransactionType.Transfer:
      await handleNewBalanceTransfer(transactionData as BalanceTransferTransaction, event.params.bookId);
      break;
    case TransactionType.Adjustment:
      await handleNewBalanceAdjustment(transactionData as AdjustmentTransaction, event.params.bookId);
      break;
    default:
      console.log('Transaction type is not income, expense, transfer or adjustment. Skipping wallet balance update.');
    }
  }
);

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
