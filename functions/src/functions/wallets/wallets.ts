import * as functions from 'firebase-functions';
import { FirestorePaths } from '../../core/firestore-paths';
import { AdjustmentTransaction } from '../transactions/balance-adjustment';
import TransactionType from '../../enums/transaction_type.enum';
import { createNewTransaction } from '../transactions/transactions';

export interface Wallet {
  name: string
  id: string,
  icon_key: string,
  balance: number,
  color: string,
  description: string | undefined,
  is_enabled: boolean,
}

export const createBalanceAdjustmentOnNewWallet = functions.firestore
  .document(`${FirestorePaths.BOOKS}/{bookId}/${FirestorePaths.WALLETS}/{walletId}`)
  .onCreate(async (snap, context) => {
    const walletData = snap.data();

    const adjustmentTransaction : AdjustmentTransaction = {
      type: TransactionType.Adjustment,
      amount: walletData.balance,
      previous_amount: 0,
      wallet_id: walletData.id,
      date: new Date()
    };
    await createNewTransaction(adjustmentTransaction, context.params.bookId);
  });
