import { create } from 'zustand';
import { Instance } from '@/interface/Instance';
import {
  getAllInstances,
  createInstance,
  updateInstance
} from '@/lib/api/instances';
import { useModulesStore } from '@/store/useModulesStore';

interface InstancesStore {
  instances: Instance[];
  isLoading: boolean;
  error: string | null;
  fetchInstances: () => Promise<void>;
  createInstance: (instanceData: {
    name: string;
    apiUrl: string;
    apiKey: string;
  }) => Promise<boolean>;
  updateInstance: (
    id: number,
    instanceData: { name: string; apiUrl: string; apiKey: string }
  ) => Promise<boolean>;
  updateInstanceInStore: (updatedInstance: Instance) => void;
  clearError: () => void;
}

export const useInstancesStore = create<InstancesStore>((set) => ({
  instances: [],
  isLoading: false,
  error: null,

  fetchInstances: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await getAllInstances();

      if (response.status === 200) {
        set({
          instances: response.data,
          isLoading: false
        });
      } else {
        set({
          error: response.message,
          isLoading: false
        });

        if (response.status === 403) {
          // Keep menu/UI consistent: if backend denies, hide this sub-item.
          useModulesStore.getState().overrideSubItemPermissions('automations', '/instances', {
            can_view: false,
            can_edit: false,
            can_delete: false
          });
        }
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch instances',
        isLoading: false
      });
    }
  },

  createInstance: async (instanceData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await createInstance(instanceData);

      if (response.status === 200 || response.status === 201) {
        set((state) => ({
          instances: [...state.instances, response.data],
          isLoading: false
        }));
        return true;
      } else {
        set({
          error: response.message,
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to create instance',
        isLoading: false
      });
      return false;
    }
  },

  updateInstance: async (id, instanceData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await updateInstance(id, instanceData);

      if (response.status === 200) {
        set((state) => ({
          instances: state.instances.map((instance) =>
            instance.id === id ? response.data : instance
          ),
          isLoading: false
        }));
        return true;
      } else {
        set({
          error: response.message,
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update instance',
        isLoading: false
      });
      return false;
    }
  },

  updateInstanceInStore: (updatedInstance: Instance) => {
    set((state) => ({
      instances: state.instances.map((instance) =>
        instance.id === updatedInstance.id ? updatedInstance : instance
      )
    }));
  },

  clearError: () => {
    set({ error: null });
  }
}));
