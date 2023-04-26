
import { addBookToOwner, addBookToMember } from './functions/books/books';
export const books = {
  addBookToOwner,
  addBookToMember
};

import { createNewUser } from './functions/users/users';
export const users = {
  createNewUser
};

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
