import { FieldValue, firestore } from '../../core/firebase-admin';
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

  const isIncome = type === TransactionType.Income ? 1 : -1;
  const newBalance = FieldValue.increment(amount * isIncome);

  await walletRef.update({ balance: newBalance });

  console.log(`Updated balance for wallet ${walletId} to ${newBalance}.`);
};

export const handleIncomeExpenseUpdate = async (
  transactionBefore: IncomeExpenseTransaction,
  transactionAfter: IncomeExpenseTransaction,
  bookId: string
): Promise<void> => {
  const walletId = transactionBefore.wallet_id;
  const typeBefore = transactionBefore.type;
  const typeAfter = transactionAfter.type;
  const amountBefore = transactionBefore.amount;
  const amountAfter = transactionAfter.amount;

  const isIncome = typeAfter === TransactionType.Income ? 1 : -1;
  const typeChanged = typeAfter !== typeBefore ? 1 : -1;

  const walletRef = firestore.doc(`books/${bookId}`);

  const newAmount = amountAfter + amountBefore * typeChanged;
  const newBalance = FieldValue.increment(newAmount * isIncome);

  await walletRef.update({ balance: newBalance });

  console.log(`Updated balance for wallet ${walletId} to ${newBalance}.`);
};

export const handleIncomeExpenseDelete = async (transactionData: IncomeExpenseTransaction, bookId: string): Promise<void> => {
  const walletId = transactionData.wallet_id;
  const type = transactionData.type;
  const amount = transactionData.amount;

  const walletRef = firestore.doc(`${FirestorePaths.BOOKS}/${bookId}/${FirestorePaths.WALLETS}/${walletId}`);

  const isExpense = type === TransactionType.Expense ? 1 : -1;
  const newBalance = FieldValue.increment(amount * isExpense);

  await walletRef.update({ balance: newBalance });

  console.log(`Updated balance for wallet ${walletId} to ${newBalance}.`);
};


