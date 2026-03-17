import { create } from 'zustand';
import { getAllRoles } from '@/lib/api/roles';
import { Role, RolesApiResponse } from '@/interface/Role';
import { useModulesStore } from '@/store/useModulesStore';

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
    let modulesState = useModulesStore.getState();
    if (!modulesState.permissionsReady) {
      await modulesState.fetchModules();
      modulesState = useModulesStore.getState();
      if (!modulesState.permissionsReady) {
        return;
      }
    }

    if (!modulesState.hasPermission('permissions', 'can_view')) {
      set({
        roles: [],
        isLoading: false,
        error: "You don't have permission to view roles."
      });
      return;
    }

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
        const friendlyMessage =
          response.status === 403
            ? "You don't have permission to view roles."
            : response.message || 'Error loading roles.';
        set({ error: friendlyMessage });

        if (response.status === 403) {
          // Keep menu/UI consistent: if backend denies, hide the whole module.
          useModulesStore.getState().overrideModulePermissions('permissions', {
            can_view: false,
            can_edit: false,
            can_delete: false
          });
        }
      }
    } catch (error) {
      const friendlyMessage =
        error instanceof Error ? error.message : 'Error loading roles.';
      set({ error: friendlyMessage });
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
