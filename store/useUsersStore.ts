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
  search: string;
  fetchUsers: (page?: number, limit?: number, search?: string) => Promise<void>;
  setSearch: (search: string) => void;
  updateUserInStore: (updatedUser: User) => void;
}

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  search: '',

  fetchUsers: async (page?: number, limit?: number, search?: string) => {
    // Use current state as defaults if params not provided
    const currentPage = page ?? get().page;
    const currentLimit = limit ?? get().limit;
    const searchQuery = search !== undefined ? search : get().search;

    // Enforce API limit of 100
    const validLimit = Math.min(currentLimit, 100);
    if (currentLimit > 100) {
      set({ 
        error: 'Limit cannot exceed 100. Maximum limit is 100.',
        isLoading: false 
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await getAllUsers(currentPage, validLimit, searchQuery);

      if ((response.status === 0 || response.status === 200) && response.data) {
        set({
          users: response.data,
          total: response.total,
          page: response.page || currentPage,
          limit: response.limit || validLimit,
          search: searchQuery
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

  setSearch: (search: string) => {
    set({ search });
  },

  updateUserInStore: (updatedUser: User) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    }));
  }
}));
