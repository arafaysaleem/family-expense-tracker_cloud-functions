import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { FirestorePaths } from '../../core/firestore-paths';
import { AdjustmentTransaction } from '../transactions/balance-adjustment';
import { TransactionType } from '../../enums/transaction_type.enum';
import { createNewTransaction } from '../transactions/transactions';

export interface Wallet {
  name: string
  id: string,
  icon_key: string,
  has_transactions: boolean,
  balance: number,
  color: string,
  description: string | undefined,
  is_enabled: boolean
}

export const createBalanceAdjustmentOnNewWallet = onDocumentCreated(
  `${FirestorePaths.BOOKS}/{bookId}/${FirestorePaths.WALLETS}/{walletId}`,
  async (event) => {
    const snap = event.data!;
    const walletData = snap.data();

    // usually for default wallets, bcz user can't create wallet with 0 balance
    if (walletData.balance === 0) return;

    const adjustmentTransaction: AdjustmentTransaction = {
      type: TransactionType.Adjustment,
      amount: walletData.balance,
      previous_amount: 0,
      wallet_id: walletData.id,
      date: new Date()
    };
    await createNewTransaction(adjustmentTransaction, event.params.bookId);
  }
);
