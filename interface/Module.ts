export interface ModulePermission {
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface ModuleSubItem {
  title: string;
  url: string;
  icon: string;
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
  error: string | null;
  lastFetched: number | null;
  fetchModules: () => Promise<void>;
  getModuleByKey: (key: string) => Module | undefined;
  getModuleByRoute: (route: string) => Module | undefined;
  hasPermission: (
    moduleKey: string,
    permission: keyof ModulePermission
  ) => boolean;
  isModuleActive: (moduleKey: string) => boolean;
  isRouteAccessible: (route: string) => boolean;
}
