
import { storageService } from '../services/storage';
import { VaultItem, Comment, UserRole } from '../types';

export const adminHandlers = {
  // Comment Moderation
  toggleCommentVisibility: (itemId: string, commentId: string) => {
    const items = storageService.getItems();
    const updated = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          comments: item.comments.map(c => 
            c.id === commentId ? { ...c, isVisible: !c.isVisible } : c
          )
        };
      }
      return item;
    });
    storageService.saveItems(updated);
    return updated;
  },

  deleteComment: (itemId: string, commentId: string) => {
    const items = storageService.getItems();
    const updated = items.map(item => {
      if (item.id === itemId) {
        const commentToDelete = item.comments.find(c => c.id === commentId);
        // If the comment had a rating, we might want to remove it from userRatings too
        // for better consistency, although simple storage makes this tricky.
        // For this logic, we filter both.
        const newComments = item.comments.filter(c => c.id !== commentId);
        const newUserRatings = commentToDelete && commentToDelete.userScore !== undefined
          ? [...item.userRatings].filter((_, i) => i !== item.comments.indexOf(commentToDelete))
          : item.userRatings;

        return {
          ...item,
          comments: newComments,
          userRatings: newUserRatings
        };
      }
      return item;
    });
    storageService.saveItems(updated);
    return updated;
  },

  // User Management
  updateUserRole: (userId: string, role: UserRole) => {
    const users = storageService.getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, role } : u);
    storageService.saveUsers(updated);
    return updated;
  },

  deleteUser: (userId: string) => {
    const users = storageService.getUsers();
    const updated = users.filter(u => u.id !== userId);
    storageService.saveUsers(updated);
    return updated;
  }
};
