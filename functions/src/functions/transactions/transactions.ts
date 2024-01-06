import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { FirestorePaths } from '../../core/firestore-paths';
import { TransactionType } from './../../enums/transaction_type.enum';
import { BalanceTransferTransaction, handleBalanceTransferUpdate } from './balance-transfer';

export const updateWalletBalanceOnTransactionUpdate = onDocumentUpdated(
  `${FirestorePaths.BOOKS}/{bookId}/{transactionCollectionId}/{transactionId}`,
  async (event) => {
    const transactionBefore = event.data!.before.data();
    const transactionAfter = event.data!.after.data();

    if (transactionAfter.type === TransactionType.Transfer) {
      await handleBalanceTransferUpdate(
        transactionBefore as BalanceTransferTransaction,
        transactionAfter as BalanceTransferTransaction,
        event.params.bookId
      );
    }
  }
);
