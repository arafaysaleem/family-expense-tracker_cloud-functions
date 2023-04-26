import { firestore } from '../../core/firebase-admin';
import { FirestorePaths } from '../../core/firestore-paths';
import TransactionType from '../../enums/transaction_type.enum';

export interface BalanceTransferTransaction {
    type: TransactionType.Transfer;
    amount: number;
    src_wallet_id: string;
    dest_wallet_id: string;
    date: Date;
    description: string | undefined;
}


export const handleNewBalanceTransfer = async (transactionData: BalanceTransferTransaction, bookId: string): Promise<void> => {
  const amount = transactionData.amount;
  const srcWalletId = transactionData.src_wallet_id;
  const destWalletId = transactionData.dest_wallet_id;

  const srcWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${srcWalletId}`);
  const destWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${destWalletId}`);

  const srcWalletData = (await srcWalletRef.get()).data()!;
  const destWalletData = (await destWalletRef.get()).data()!;

  const newSrcBalance = srcWalletData.balance - amount;
  const newDestBalance = destWalletData.balance + amount;

  await srcWalletRef.update({ balance: newSrcBalance });
  await destWalletRef.update({ balance: newDestBalance });

  console.log(`Updated balance for src wallet ${srcWalletId} to ${newSrcBalance} and dest wallet ${destWalletId} to ${newDestBalance}.`);
};


