import { FieldValue, firestore } from '../../core/firebase-admin';
import { FirestorePaths } from '../../core/firestore-paths';
import { TransactionType } from '../../enums/transaction_type.enum';

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

  const newSrcBalance = FieldValue.increment(-amount);
  const newDestBalance = FieldValue.increment(amount);

  await Promise.all([
    srcWalletRef.update({ balance: newSrcBalance }),
    destWalletRef.update({ balance: newDestBalance })
  ]);

  console.log(`Updated balance for src wallet ${srcWalletId} to ${newSrcBalance} and dest wallet ${destWalletId} to ${newDestBalance}.`);
};

export const handleBalanceTransferUpdate = async (
  transactionBefore: BalanceTransferTransaction,
  transactionAfter: BalanceTransferTransaction,
  bookId: string
): Promise<void> => {
  const { amount: oldAmount, src_wallet_id: oldSrcWalletId, dest_wallet_id: oldDestWalletId } = transactionBefore;
  const { amount: newAmount, src_wallet_id: newSrcWalletId, dest_wallet_id: newDestWalletId } = transactionAfter;

  if (oldSrcWalletId !== newSrcWalletId) {
    console.log('Src wallet changed, updating old and new src wallet balances');
    // if the src wallet has changed, update old and new src wallets
    const oldSrcWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${oldSrcWalletId}`);

    const newSrcWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${newSrcWalletId}`);

    await Promise.all([
      oldSrcWalletRef.update({ balance: FieldValue.increment(oldAmount) }),
      newSrcWalletRef.update({ balance: FieldValue.increment(-newAmount) })
    ]);
  } else if (oldAmount !== newAmount) {
    console.log('Amount changed, updating src wallet balance');
    const oldSrcWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${oldSrcWalletId}`);
    const diff = newAmount - oldAmount;
    await oldSrcWalletRef.update({ balance: FieldValue.increment(-diff) });
  }

  if (oldDestWalletId !== newDestWalletId) {
    console.log('Dest wallet changed, updating old and new dest wallet balances');
    // if the dest wallet has changed, update old and new dest wallets
    const oldDestWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${oldDestWalletId}`);
    const newDestWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${newDestWalletId}`);

    await Promise.all([
      oldDestWalletRef.update({ balance: FieldValue.increment(-oldAmount) }),
      newDestWalletRef.update({ balance: FieldValue.increment(newAmount) })
    ]);
  } else if (oldAmount !== newAmount) {
    console.log('Amount changed, updating dest wallet balance');
    const oldDestWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${oldDestWalletId}`);
    const diff = newAmount - oldAmount;
    await oldDestWalletRef.update({ balance: FieldValue.increment(diff) });
  }
};

export const handleBalanceTransferDelete = async (transactionData: BalanceTransferTransaction, bookId: string): Promise<void> => {
  const srcWalletId = transactionData.src_wallet_id;
  const destWalletId = transactionData.dest_wallet_id;
  const amount = transactionData.amount;

  const srcWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${srcWalletId}`);
  const newSrcBalance = FieldValue.increment(amount);

  const destWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${destWalletId}`);
  const newDestBalance = FieldValue.increment(-amount);

  await Promise.all([
    srcWalletRef.update({ balance: newSrcBalance }),
    destWalletRef.update({ balance: newDestBalance })
  ]);

  console.log(`Updated balance for wallet ${srcWalletId} to ${newSrcBalance}.`);
  console.log(`Updated balance for wallet ${destWalletId} to ${newDestBalance}.`);
};
