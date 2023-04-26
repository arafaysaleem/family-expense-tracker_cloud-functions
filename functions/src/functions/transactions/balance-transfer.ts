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
    const oldSrcWalletData = (await oldSrcWalletRef.get()).data()!;
    
    const newSrcWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${newSrcWalletId}`);
    const newSrcWalletData = (await newSrcWalletRef.get()).data()!;

    await Promise.all([
      oldSrcWalletRef.update({ balance: oldSrcWalletData.balance + oldAmount }),
      newSrcWalletRef.update({ balance: newSrcWalletData.balance - newAmount })
    ]);
  } else if (oldAmount !== newAmount) {
    console.log('Amount changed, updating src wallet balance');
    const oldSrcWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${oldSrcWalletId}`);
    const oldSrcWalletData = (await oldSrcWalletRef.get()).data()!;
    await oldSrcWalletRef.update({ balance: oldSrcWalletData.balance - (newAmount - oldAmount) });
  }

  if (oldDestWalletId !== newDestWalletId) {
    console.log('Dest wallet changed, updating old and new dest wallet balances');
    // if the dest wallet has changed, update old and new dest wallets
    const oldDestWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${oldDestWalletId}`);
    const newDestWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${newDestWalletId}`);

    const oldDestWalletData = (await oldDestWalletRef.get()).data()!;
    const newDestWalletData = (await newDestWalletRef.get()).data()!;

    await Promise.all([
      oldDestWalletRef.update({ balance: oldDestWalletData.balance - oldAmount }),
      newDestWalletRef.update({ balance: newDestWalletData.balance + newAmount })
    ]);
  } else if (oldAmount !== newAmount) {
    console.log('Amount changed, updating dest wallet balance');
    const oldDestWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${oldDestWalletId}`);
    const oldDestWalletData = (await oldDestWalletRef.get()).data()!;
    await oldDestWalletRef.update({ balance: oldDestWalletData.balance + (newAmount - oldAmount) });
  }
};

export const handleBalanceTransferDelete = async (transactionData: BalanceTransferTransaction, bookId: string): Promise<void> => {
  const srcWalletId = transactionData.src_wallet_id;
  const destWalletId = transactionData.dest_wallet_id;
  const amount = transactionData.amount;

  const srcWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${srcWalletId}`);
  const srcWalletData = (await srcWalletRef.get()).data()!;
  const newSrcBalance = srcWalletData.balance + amount;
  
  const destWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${destWalletId}`);
  const destWalletData = (await destWalletRef.get()).data()!;
  const newDestBalance = destWalletData.balance - amount;

  await Promise.all([
    srcWalletRef.update({ balance: newSrcBalance }),
    destWalletRef.update({ balance: newDestBalance })
  ]);

  console.log(`Updated balance for wallet ${srcWalletId} to ${newSrcBalance}.`);
  console.log(`Updated balance for wallet ${destWalletId} to ${newDestBalance}.`);
};
