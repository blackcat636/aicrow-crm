import { create } from 'zustand';
import { getAllUsers } from '@/lib/api/users';
import { User } from '@/interface/User';

interface UsersStore {
  users: User[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  fetchUsers: (page?: number, limit?: number) => Promise<void>;
  updateUserInStore: (updatedUser: User) => void;
}

export const useUsersStore = create<UsersStore>((set) => ({
  users: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,

  fetchUsers: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllUsers(page, limit);

      if ((response.status === 0 || response.status === 200) && response.data) {
        set({
          users: response.data,
          total: response.total,
          page: response.page,
          limit: response.limit
        });
      } else {
        set({ error: response.message || 'Error loading users' });
      }
    } catch (error) {
      set({ error: 'Error loading users' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateUserInStore: (updatedUser: User) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    }));
  }
}));
