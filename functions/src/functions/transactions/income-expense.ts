import { FieldValue, firestore } from '../../core/firebase-admin';
import { FirestorePaths } from '../../core/firestore-paths';
import { TransactionType } from '../../enums/transaction_type.enum';

export interface IncomeExpenseTransaction {
  type: TransactionType.Income | TransactionType.Expense;
  amount: number;
  wallet_id: string;
  category_id: string;
  date: Date;
  description: string | undefined;
}

export const handleIncomeExpenseUpdate = async (
  transactionBefore: IncomeExpenseTransaction,
  transactionAfter: IncomeExpenseTransaction,
  bookId: string
): Promise<void> => {
  const amountBefore = transactionBefore.amount;
  const amountAfter = transactionAfter.amount;

  if (amountBefore !== amountAfter) {
    const oldWalletId = transactionBefore.wallet_id;
    const newWalletId = transactionAfter.wallet_id;
    const typeBefore = transactionBefore.type;
    const typeAfter = transactionAfter.type;

    const beforeIsIncome = typeBefore === TransactionType.Income ? 1 : -1;
    const afterIsIncome = typeAfter === TransactionType.Income ? 1 : -1;
    const typeChanged = typeAfter !== typeBefore ? 1 : -1;

    const newAmount = amountAfter + amountBefore * typeChanged;
    const newBalance = FieldValue.increment(newAmount * afterIsIncome);

    const oldWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${oldWalletId}`);

    if (oldWalletId !== newWalletId) {
      // if the wallet has changed, update old and new wallets
      const newWalletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${newWalletId}`);

      await Promise.all([
        oldWalletRef.update({ balance: FieldValue.increment(-amountBefore * beforeIsIncome) }),
        newWalletRef.update({ balance: newBalance })
      ]);
    } else {
      // if the wallet hasn't changed, only update the wallet
      await oldWalletRef.update({ balance: newBalance });
    }
    console.log(`Updated balance for wallet ${oldWalletId} to ${newBalance}.`);
  }
};


