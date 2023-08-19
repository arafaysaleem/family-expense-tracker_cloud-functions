
// Book functions
import { addBookToOwner, addBookToMember, deleteBookFromMembers } from './functions/books/books';
export const books = {
  addBookToOwner,
  addBookToMember,
  deleteBookFromMembers
};

// User functions
import { createNewUser } from './functions/users/users';
export const users = {
  createNewUser
};

// Transaction functions
import {
  updateWalletBalanceOnNewTransaction,
  updateWalletBalanceOnTransactionUpdate,
  updateWalletBalanceOnTransactionDelete
} from './functions/transactions/transactions';
export const transactions = {
  updateWalletBalanceOnNewTransaction,
  updateWalletBalanceOnTransactionUpdate,
  updateWalletBalanceOnTransactionDelete
};

// Wallet functions
import { createBalanceAdjustmentOnNewWallet } from './functions/wallets/wallets';
export const wallets = {
  createBalanceAdjustmentOnNewWallet
};
