import { storageService } from '../services/storage';
import { VaultItem, Comment, UserRole } from '../types';

export const adminHandlers = {
  // Comment Moderation
  toggleCommentVisibility: async (itemId: string, commentId: string) => {
    const items = await storageService.getItems();
    const item = items.find(i => i.id === itemId);
    if (!item) return items;

    const updatedItem = {
      ...item,
      comments: item.comments.map(c =>
        c.id === commentId ? { ...c, isVisible: !c.isVisible } : c
      )
    };

    await storageService.updateItem(updatedItem);
    return updatedItem;
  },

  deleteComment: async (itemId: string, commentId: string) => {
    const items = await storageService.getItems();
    const item = items.find(i => i.id === itemId);
    if (!item) return items;

    const commentToDelete = item.comments.find(c => c.id === commentId);
    if (!commentToDelete) return item;

    const newComments = item.comments.filter(c => c.id !== commentId);
    const newUserRatings = [...(item.userRatings || [])].filter((_, i) =>
      i !== item.comments.indexOf(commentToDelete)
    );

    const updatedItem = {
      ...item,
      comments: newComments,
      userRatings: newUserRatings
    };

    await storageService.updateItem(updatedItem);
    return updatedItem;
  },

  // User Management
  updateUserRole: async (userId: string, role: UserRole) => {
    await storageService.updateUserProfile(userId, { role });
    return storageService.getUsers();
  },

  deleteUser: async (userId: string) => {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('../services/firebase');
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    return storageService.getUsers();
  }
};
