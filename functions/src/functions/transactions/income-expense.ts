import { firestore } from '../../core/firebase-admin';
import { FirestorePaths } from '../../core/firestore-paths';
import TransactionType from '../../enums/transaction_type.enum';

export interface IncomeExpenseTransaction {
  type: TransactionType.Income | TransactionType.Expense;
  amount: number;
  wallet_id: string;
  category_id: string;
  date: Date;
  description: string | undefined;
}


export const handleNewIncomeExpense = async (transactionData: IncomeExpenseTransaction, bookId: string): Promise<void> => {
  const walletId = transactionData.wallet_id;
  const type = transactionData.type;
  const amount = transactionData.amount;
  
  const walletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${walletId}`);
  const walletDoc = await walletRef.get();
  const walletData = walletDoc.data()!;
  
  const isIncome = type === TransactionType.Income ? 1 : -1;
  const newBalance = walletData.balance + amount * isIncome;
  
  await walletRef.update({ balance: newBalance });
  
  console.log(`Updated balance for wallet ${walletId} to ${newBalance}.`);
};
  

