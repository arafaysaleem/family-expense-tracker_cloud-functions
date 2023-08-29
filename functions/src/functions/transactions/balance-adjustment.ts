import { FieldValue, firestore } from '../../core/firebase-admin';
import { FirestorePaths } from '../../core/firestore-paths';
import TransactionType from '../../enums/transaction_type.enum';
import { v4 as uuidv4 } from 'uuid';
import { formatDateToISO } from '../../utils/utils';

export interface AdjustmentTransaction {
    type: TransactionType.Adjustment;
    amount: number;
    previous_amount: number;
    wallet_id: string;
    date: Date;
}

export const createNewBalanceAdjustment = async (transactionData: AdjustmentTransaction, bookId: string): Promise<void> => {
  const transMonth = transactionData.date.getMonth() + 1; // starts from 0
  const transYear = transactionData.date.getFullYear();
  const transCollectionId = `${FirestorePaths.TRANSACTIONS}-${transMonth}-${transYear}`;

  const transRef = firestore.collection(FirestorePaths.BOOKS).doc(bookId).collection(transCollectionId);

  const id: string = uuidv4();
  const { date: transDate, ...rest } = transactionData;
  const transactionDataWithDate = {
    id: id,
    date: formatDateToISO(transDate),
    ...rest
  };
  await transRef.doc(id).set(transactionDataWithDate);

  const newBalance = transactionData.amount;
  console.log(`Adjusted balance for wallet id: ${transactionData.wallet_id}, to: ${newBalance}.`);
};

export const handleNewBalanceAdjustment = async (transactionData: AdjustmentTransaction, bookId: string): Promise<void> => {
  const walletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${transactionData.wallet_id}`);

  const newBalance = transactionData.amount;
  await walletRef.update({ balance: newBalance });

  console.log(`Adjusted balance for wallet id: ${transactionData.wallet_id}, to: ${newBalance}.`);
};

export const handleBalanceAdjustmentDelete = async (transactionData: AdjustmentTransaction, bookId: string): Promise<void> => {
  const walletId = transactionData.wallet_id;
  const nowAmount = transactionData.amount;
  const previousAmount = transactionData.previous_amount;

  const walletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${walletId}`);

  const diff = nowAmount - previousAmount;
  const newBalance = FieldValue.increment(-diff);

  await walletRef.update({ balance: newBalance });

  console.log(`Adjusted balance for wallet id: ${walletId}, to: ${newBalance}.`);
};

