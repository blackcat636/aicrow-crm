import { create } from 'zustand';
import { getAllUsers, UserFilters } from '@/lib/api/users';
import { User } from '@/interface/User';

interface UsersStore {
  users: User[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  filters: Omit<UserFilters, 'page' | 'limit'>;
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  updateUserInStore: (updatedUser: User) => void;
}

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  filters: {},

  fetchUsers: async (filters: UserFilters = {}) => {
    // Use current state as defaults if params not provided
    const currentPage = filters.page ?? get().page;
    const currentLimit = filters.limit ?? get().limit;
    const currentFilters = get().filters;

    // Merge filters - handle undefined values to explicitly clear filters
    const mergedFilters: UserFilters = {
      page: currentPage,
      limit: currentLimit,
      ...currentFilters,
      ...filters
    };
    
    // Remove undefined values to clear filters
    if (mergedFilters.id === undefined) delete mergedFilters.id;
    if (mergedFilters.email === undefined) delete mergedFilters.email;
    if (mergedFilters.username === undefined) delete mergedFilters.username;
    if (mergedFilters.firstName === undefined) delete mergedFilters.firstName;
    if (mergedFilters.lastName === undefined) delete mergedFilters.lastName;
    if (mergedFilters.phone === undefined) delete mergedFilters.phone;
    if (mergedFilters.role === undefined) delete mergedFilters.role;
    if (mergedFilters.isActive === undefined) delete mergedFilters.isActive;

    // Enforce API limit of 100
    const validLimit = Math.min(mergedFilters.limit || 10, 100);
    if ((mergedFilters.limit || 10) > 100) {
      set({ 
        error: 'Limit cannot exceed 100. Maximum limit is 100.',
        isLoading: false 
      });
      return;
    }

    mergedFilters.limit = validLimit;

    set({ isLoading: true, error: null });
    try {
      const response = await getAllUsers(mergedFilters);

      if ((response.status === 0 || response.status === 200) && response.data) {
        // Extract filters without page and limit for storage
        const { page: _, limit: __, ...filterState } = mergedFilters;
        
        set({
          users: response.data,
          total: response.total,
          page: response.page || currentPage,
          limit: response.limit || validLimit,
          filters: filterState
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
