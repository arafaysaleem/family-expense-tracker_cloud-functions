
import { addBookToOwner, addBookToMember } from './books';
export const books = {
  addBookToOwner,
  addBookToMember
};

import { createNewUser } from './users';
export const users = {
  createNewUser
};

import { updateWalletBalanceOnNewTransaction, updateWalletBalanceOnTransactionUpdate } from './transactions';
export const transactions = {
  updateWalletBalanceOnNewTransaction,
  updateWalletBalanceOnTransactionUpdate
};
