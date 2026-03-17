export interface ModulePermission {
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface PersistedModuleOverrides {
  modules: Record<string, Partial<ModulePermission>>;
  subItems: Record<string, Record<string, Partial<ModulePermission>>>;
}

export interface ModuleSubItem {
  title: string;
  url: string;
  icon: string;
  permissions?: ModulePermission;
}

export interface Module {
  key: string;
  name: string;
  routes: string[];
  icon: string;
  menu: boolean;
  order: number;
  permissions: ModulePermission;
  subItems?: ModuleSubItem[];
}

export interface ModulesResponse {
  status: number;
  data: Module[];
  message: string;
  error?: string;
}

export interface ModuleStore {
  modules: Module[];
  isLoading: boolean;
  permissionsReady: boolean;
  error: string | null;
  lastFetched: number | null;
  overrideUserId: number | null;
  _persistedOverrides: PersistedModuleOverrides;
  fetchModules: () => Promise<void>;
  setOverrideUser: (userId: number | string | null) => void;
  overrideModulePermissions: (
    moduleKey: string,
    patch: Partial<ModulePermission>
  ) => void;
  overrideSubItemPermissions: (
    moduleKey: string,
    subItemUrl: string,
    patch: Partial<ModulePermission>
  ) => void;
  getModuleByKey: (key: string) => Module | undefined;
  getModuleByRoute: (route: string) => Module | undefined;
  hasPermission: (
    moduleKey: string,
    permission: keyof ModulePermission
  ) => boolean;
  isModuleActive: (moduleKey: string) => boolean;
  isRouteAccessible: (route: string) => boolean;
}
