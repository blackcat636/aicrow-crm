import { create } from 'zustand';
import { getAllUsers, UserFilters } from '@/lib/api/users';
import { User } from '@/interface/User';
import { useModulesStore } from '@/store/useModulesStore';

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
    // Gate network calls behind loaded permissions to avoid "fetch then deny" flicker
    // and repeated 403 spam when user lacks access.
    let modulesState = useModulesStore.getState();
    if (!modulesState.permissionsReady) {
      await modulesState.fetchModules();
      modulesState = useModulesStore.getState();
      if (!modulesState.permissionsReady) {
        return;
      }
    }

    if (!modulesState.hasPermission('users', 'can_view')) {
      set({
        isLoading: false,
        users: [],
        total: 0,
        error: "You don't have permission to view users.",
      });
      return;
    }

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
        const friendlyMessage =
          response.status === 403
            ? "You don't have permission to view users."
            : response.message || 'Error loading users';
        set({ error: friendlyMessage });

        if (response.status === 403) {
          // Keep menu/UI consistent: if backend denies, hide the module actions.
          useModulesStore
            .getState()
            .overrideModulePermissions('users', {
              can_view: false,
              can_edit: false,
              can_delete: false
            });
        }
      }
    } catch (error) {
      const friendlyMessage =
        error instanceof Error ? error.message : 'Error loading users';
      set({ error: friendlyMessage });
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
