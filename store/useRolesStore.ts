import { create } from 'zustand';
import { getAllRoles } from '@/lib/api/roles';
import { Role, RolesApiResponse } from '@/interface/Role';

interface RolesStore {
  roles: Role[];
  isLoading: boolean;
  error: string | null;
  fetchRoles: () => Promise<void>;
  updateRoleInStore: (updatedRole: Role) => void;
  removeRoleFromStore: (roleId: number) => void;
  addRoleToStore: (role: Role) => void;
}

export const useRolesStore = create<RolesStore>((set, get) => ({
  roles: [],
  isLoading: false,
  error: null,

  fetchRoles: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllRoles();

      if ((response.status === 0 || response.status === 200) && response.data) {
        // Use roles directly without fetching children to avoid unnecessary API calls
        // Children roles are only needed in specific contexts (e.g., permissions management page)
        set({
          roles: response.data,
          error: null
        });
      } else {
        set({ error: response.message || 'Error loading roles' });
      }
    } catch (error) {
      set({ error: 'Error loading roles' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateRoleInStore: (updatedRole: Role) => {
    set((state) => ({
      roles: state.roles.map((role) =>
        role.id === updatedRole.id ? updatedRole : role
      )
    }));
  },

  removeRoleFromStore: (roleId: number) => {
    set((state) => ({
      roles: state.roles.filter((role) => role.id !== roleId)
    }));
  },

  addRoleToStore: (role: Role) => {
    set((state) => ({
      roles: [...state.roles, role]
    }));
  }
}));
