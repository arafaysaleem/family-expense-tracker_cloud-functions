import { FieldValue, firestore } from '../../core/firebase-admin';
import { FirestorePaths } from '../../core/firestore-paths';
import TransactionType from '../../enums/transaction_type.enum';

export interface AdjustmentTransaction {
    type: TransactionType.Adjustment;
    amount: number;
    previous_amount: number;
    wallet_id: string;
    date: Date;
    description: string | undefined;
}

export const handleNewBalanceAdjustment = async (transactionData: AdjustmentTransaction, bookId: string): Promise<void> => {
  const walletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${transactionData.wallet_id}`);

  const newBalance = transactionData.amount;
  await walletRef.update({ balance: newBalance });

  console.log(`Updated balance for wallet ${transactionData.wallet_id} to ${newBalance}.`);
};

export const handleBalanceAdjustmentDelete = async (transactionData: AdjustmentTransaction, bookId: string): Promise<void> => {
  const walletId = transactionData.wallet_id;
  const nowAmount = transactionData.amount;
  const previousAmount = transactionData.previous_amount;

  const walletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${walletId}`);

  const diff = nowAmount - previousAmount;
  const newBalance = FieldValue.increment(-diff);

  await walletRef.update({ balance: newBalance });

  console.log(`Updated balance for wallet ${walletId} to ${newBalance}.`);
};

