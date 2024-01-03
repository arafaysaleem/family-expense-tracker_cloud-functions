import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { FirestorePaths } from '../../core/firestore-paths';
import { TransactionType } from './../../enums/transaction_type.enum';
import { BalanceTransferTransaction, handleBalanceTransferUpdate } from './balance-transfer';
import { handleIncomeExpenseUpdate, IncomeExpenseTransaction } from './income-expense';

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
