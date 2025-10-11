import { create } from 'zustand';
import { Module, ModuleStore, ModulesResponse } from '@/interface/Module';

export const useModulesStore = create<ModuleStore>((set, get) => ({
  modules: [],
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchModules: async () => {
    const { lastFetched } = get();
    const now = Date.now();

    // Cache for 5 minutes to avoid unnecessary requests
    if (lastFetched && now - lastFetched < 5 * 60 * 1000) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/modules/active', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ModulesResponse = await response.json();

      if (data.status === 200 && data.data) {
        set({
          modules: data.data,
          lastFetched: now,
          isLoading: false
        });
      } else {
        throw new Error(data.error || 'Failed to fetch modules');
      }
    } catch (error) {
      console.error('❌ Error fetching modules:', error);
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      });
    }
  },

  getModuleByKey: (key: string) => {
    const { modules } = get();
    return modules.find((module) => module.key === key);
  },

  getModuleByRoute: (route: string) => {
    const { modules } = get();
    return modules.find((module) =>
      module.routes.some(
        (moduleRoute) =>
          route === moduleRoute ||
          (moduleRoute !== '/' && route.startsWith(moduleRoute))
      )
    );
  },

  hasPermission: (
    moduleKey: string,
    permission: keyof Module['permissions']
  ) => {
    const { modules, error } = get();
    const module = modules.find((m) => m.key === moduleKey);

    // If API failed or no modules loaded, allow access as fallback
    if (error || modules.length === 0) {
      console.log(
        `🔄 Fallback: Allowing access to ${moduleKey} (API error or no modules)`
      );
      return true;
    }

    return module ? module.permissions[permission] : false;
  },

  isModuleActive: (moduleKey: string) => {
    const { modules, error } = get();

    // If API failed or no modules loaded, consider module active as fallback
    if (error || modules.length === 0) {
      return true;
    }

    return modules.some((module) => module.key === moduleKey);
  },

  isRouteAccessible: (route: string) => {
    const { modules, error } = get();

    // If API failed or no modules loaded, allow access as fallback
    if (error || modules.length === 0) {
      return true;
    }

    return modules.some((module) =>
      module.routes.some(
        (moduleRoute) =>
          route === moduleRoute ||
          (moduleRoute !== '/' && route.startsWith(moduleRoute))
      )
    );
  }
}));
