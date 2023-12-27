
// Book functions
import { setupNewBookDefaults, deleteBookFromMembers } from './functions/books/books';
export const books = {
  setupNewBookDefaults,
  deleteBookFromMembers
};

// User functions
import { createNewUser } from './functions/users/users';
export const users = {
  createNewUser
};

// Transaction functions
import {
  updateWalletBalanceOnTransactionUpdate,
  updateWalletBalanceOnTransactionDelete
} from './functions/transactions/transactions';
export const transactions = {
  updateWalletBalanceOnTransactionUpdate,
  updateWalletBalanceOnTransactionDelete
};

// Wallet functions
import { createBalanceAdjustmentOnNewWallet } from './functions/wallets/wallets';
export const wallets = {
  createBalanceAdjustmentOnNewWallet
};
