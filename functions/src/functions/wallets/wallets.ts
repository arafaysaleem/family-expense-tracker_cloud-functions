import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { FirestorePaths } from '../../core/firestore-paths';
import { AdjustmentTransaction, createNewBalanceAdjustment } from '../transactions/balance-adjustment';
import { TransactionType } from '../../enums/transaction_type.enum';

export interface Wallet {
  name: string
  id: string,
  icon_key: string,
  transactions_count: number,
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
    await createNewBalanceAdjustment(adjustmentTransaction, event.params.bookId);
  }
);
