
// Book functions
import { setupNewBookDefaults, deleteBookFromMembers } from './functions/books/books';
export const books = {
  setupNewBookDefaults,
  deleteBookFromMembers
};

// User functions
import { createNewUser, updateUserImageAcrossBooks } from './functions/users/users';
export const users = {
  createNewUser,
  updateUserImageAcrossBooks
};
