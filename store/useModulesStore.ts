import { create } from 'zustand';
import { Module, ModuleStore, ModulesResponse, ModulePermission } from '@/interface/Module';
import { useUserStore } from '@/store/useUserStore';
import { coerceNumericUserId, extractNumericUserIdFromAccessToken } from '@/lib/auth-user-id';

const mergeDenyOnly = (
  base: ModulePermission,
  patch?: Partial<ModulePermission>
): ModulePermission => {
  if (!patch) return base;
  const next = { ...base };
  if (patch.can_view === false) next.can_view = false;
  if (patch.can_edit === false) next.can_edit = false;
  if (patch.can_delete === false) next.can_delete = false;
  return next;
};

type PersistedOverrides = {
  modules: Record<string, Partial<Module['permissions']>>;
  subItems: Record<string, Record<string, Partial<Module['permissions']>>>;
};

const emptyOverrides = (): PersistedOverrides => ({ modules: {}, subItems: {} });

const storageKey = (userId: number) => `module_overrides:${userId}`;

const shouldDebug = () => {
  if (process.env.NODE_ENV === 'development') return true;
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem('debug_perms') === '1';
  } catch {
    return false;
  }
};

const logDebug = (label: string, data?: unknown) => {
  if (!shouldDebug()) return;
  console.log(`[ModuleStore:${label}]`, data);
};

const normalizeRoute = (value: string) => {
  // Keep only pathname, strip query/hash, remove trailing slashes (except root).
  const base = value.split('#')[0].split('?')[0].trim();
  if (base === '/') return '/';
  return base.replace(/\/+$/, '');
};

const readOverrides = (userId: number): PersistedOverrides => {
  if (typeof window === 'undefined') return emptyOverrides();

  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return emptyOverrides();
    const parsed = JSON.parse(raw) as Partial<PersistedOverrides>;
    const overrides = {
      modules: parsed.modules ?? {},
      subItems: parsed.subItems ?? {}
    };

    logDebug('readOverrides', {
      userId,
      modulesKeys: Object.keys(overrides.modules),
      subItemModuleKeys: Object.keys(overrides.subItems),
    });

    return overrides;
  } catch {
    logDebug('readOverrides failed (parse/storage)', { userId });
    return emptyOverrides();
  }
};

const writeOverrides = (userId: number, overrides: PersistedOverrides) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(overrides));
    logDebug('writeOverrides', {
      userId,
      modulesKeys: Object.keys(overrides.modules),
      subItemModuleKeys: Object.keys(overrides.subItems),
    });
  } catch {
    // Ignore quota/serialization errors.
    logDebug('writeOverrides failed (quota/storage)', { userId });
  }
};

const resolveCurrentUserId = (fallback: unknown): number | null => {
  const fallbackNum = coerceNumericUserId(fallback);
  if (fallbackNum) return fallbackNum;
  // In some flows, module overrides are triggered before AuthProvider sets overrideUserId.
  // Use user store as a reliable client-side fallback.
  const userStoreRaw = useUserStore.getState().user?.id ?? null;
  const userStoreId = coerceNumericUserId(userStoreRaw);
  const tokenId = userStoreId ? null : extractNumericUserIdFromAccessToken();
  const resolved = userStoreId ?? tokenId ?? null;
  logDebug('resolveCurrentUserId', { fallback, userStoreRaw, userStoreId, tokenId, resolved });
  return resolved;
};

const applyOverridesToModules = (modules: Module[], overrides: PersistedOverrides): Module[] => {
  return modules.map((m) => {
    const modulePatch = overrides.modules[m.key];
    const patchedModule: Module = modulePatch
      ? {
          ...m,
          permissions: mergeDenyOnly(m.permissions, modulePatch)
        }
      : m;

    const subItemPatches = overrides.subItems[m.key];
    if (!patchedModule.subItems?.length || !subItemPatches) {
      return patchedModule;
    }

    return {
      ...patchedModule,
      subItems: patchedModule.subItems.map((s) => {
        const patch = subItemPatches[normalizeRoute(s.url)];
        if (!patch) return s;
        return {
          ...s,
          permissions: mergeDenyOnly(
            (s.permissions ?? patchedModule.permissions),
            patch
          )
        };
      })
    };
  });
};

export const useModulesStore = create<ModuleStore>((set, get) => ({
  modules: [],
  isLoading: false,
  permissionsReady: false,
  error: null,
  lastFetched: null,
  overrideUserId: null,
  _persistedOverrides: emptyOverrides(),

  setOverrideUser: (userId) => {
    const numericUserId = resolveCurrentUserId(userId);
    if (!numericUserId) {
      logDebug('setOverrideUser(null) - clearing in-memory overrides');
      set({
        overrideUserId: null,
        _persistedOverrides: emptyOverrides()
      });
      return;
    }

    const overrides = readOverrides(numericUserId);
    logDebug('setOverrideUser', {
      rawUserId: userId,
      userId: numericUserId,
      modulesCount: get().modules.length,
      overridesModulesKeys: Object.keys(overrides.modules),
      overridesSubItemModuleKeys: Object.keys(overrides.subItems),
    });
    set((state) => ({
      overrideUserId: numericUserId,
      _persistedOverrides: overrides,
      // Apply immediately to current modules to avoid "show then hide" after refresh.
      modules: applyOverridesToModules(state.modules, overrides)
    }));
  },

  overrideModulePermissions: (moduleKey, patch) => {
    set((state) => {
      logDebug('overrideModulePermissions', {
        moduleKey,
        patch,
        overrideUserId: state.overrideUserId,
      });
      const nextModules = state.modules.map((m) =>
        m.key === moduleKey
          ? {
              ...m,
              permissions: mergeDenyOnly(m.permissions, patch)
            }
          : m
      );

      const overrides = { ...state._persistedOverrides };
      overrides.modules = { ...overrides.modules, [moduleKey]: { ...(overrides.modules[moduleKey] ?? {}), ...patch } };

      const userId = resolveCurrentUserId(state.overrideUserId);
      if (userId) {
        writeOverrides(userId, overrides);
      } else {
        logDebug('overrideModulePermissions: skip persist (no userId yet)', { moduleKey });
      }

      return {
        modules: nextModules,
        _persistedOverrides: overrides
      };
    });
  },

  overrideSubItemPermissions: (moduleKey, subItemUrl, patch) => {
    set((state) => {
      logDebug('overrideSubItemPermissions', {
        moduleKey,
        subItemUrl,
        patch,
        overrideUserId: state.overrideUserId,
      });
      const normalizedSubItemUrl = normalizeRoute(subItemUrl);
      const nextModules = state.modules.map((m) => {
        if (m.key !== moduleKey) return m;
        if (!m.subItems || m.subItems.length === 0) return m;

        const updated = {
          ...m,
          subItems: m.subItems.map((s) =>
            normalizeRoute(s.url) === normalizedSubItemUrl
              ? {
                  ...s,
                  permissions: mergeDenyOnly(
                    (s.permissions ?? m.permissions),
                    patch
                  )
                }
              : s
          )
        };

        const anyVisible = updated.subItems.some(
          (s) => (s.permissions?.can_view ?? updated.permissions.can_view) === true
        );

        // If all sub-items are denied, hide the whole module from the menu as well.
        if (!anyVisible) {
          return {
            ...updated,
            permissions: {
              ...updated.permissions,
              can_view: false,
              can_edit: false,
              can_delete: false
            }
          };
        }

        return updated;
      });

      const overrides = { ...state._persistedOverrides };
      overrides.subItems = { ...overrides.subItems };
      overrides.subItems[moduleKey] = { ...(overrides.subItems[moduleKey] ?? {}) };
      overrides.subItems[moduleKey][normalizedSubItemUrl] = {
        ...(overrides.subItems[moduleKey][normalizedSubItemUrl] ?? {}),
        ...patch
      };

      // If the computed effect was "hide whole module", persist that too.
      const updatedModule = nextModules.find((m) => m.key === moduleKey);
      if (updatedModule && updatedModule.permissions.can_view === false) {
        overrides.modules = {
          ...overrides.modules,
          [moduleKey]: {
            ...(overrides.modules[moduleKey] ?? {}),
            can_view: false,
            can_edit: false,
            can_delete: false
          }
        };
      }

      const userId = resolveCurrentUserId(state.overrideUserId);
      if (userId) {
        writeOverrides(userId, overrides);
      } else {
        logDebug('overrideSubItemPermissions: skip persist (no userId yet)', { moduleKey, subItemUrl });
      }

      return {
        modules: nextModules,
        _persistedOverrides: overrides
      };
    });
  },

  fetchModules: async () => {
    const { lastFetched } = get();
    const now = Date.now();

    // Cache for 5 minutes to avoid unnecessary requests
    if (lastFetched && now - lastFetched < 5 * 60 * 1000) {
      logDebug('fetchModules: skip (cache valid)', { lastFetched, now });
      return;
    }

    set({ isLoading: true, permissionsReady: false, error: null });

    try {
      // Ensure we have the right persisted overrides for the current user before applying.
      const state = get();
      const userId = resolveCurrentUserId(state.overrideUserId);
      const effectiveOverrides = userId ? readOverrides(userId) : state._persistedOverrides;
      logDebug('fetchModules: preflight', {
        overrideUserId: state.overrideUserId,
        resolvedUserId: userId,
        effectiveOverridesModulesKeys: Object.keys(effectiveOverrides.modules),
        effectiveOverridesSubItemModuleKeys: Object.keys(effectiveOverrides.subItems),
      });
      if (userId && state.overrideUserId !== userId) {
        // Sync store with resolved userId so subsequent writes are consistent.
        set({ overrideUserId: userId, _persistedOverrides: effectiveOverrides });
      } else if (state._persistedOverrides !== effectiveOverrides) {
        set({ _persistedOverrides: effectiveOverrides });
      }

      const response = await fetch('/api/modules/active', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const rawData = await response.json().catch(() => null);

      if (!response.ok) {
        logDebug('fetchModules: failed', { status: response.status });
        set({
          modules: [],
          lastFetched: now,
          error:
            (rawData as { message?: string })?.message ||
            `HTTP error! status: ${response.status}`,
          isLoading: false,
          permissionsReady: false,
        });
        return;
      }

      const data: ModulesResponse = rawData as ModulesResponse;

      if (data.status === 200 && Array.isArray(data.data)) {
        const patched = applyOverridesToModules(data.data, effectiveOverrides);
        logDebug('fetchModules: success', {
          receivedModulesCount: data.data.length,
          patchedModulesCount: patched.length,
          // Helpful for debugging mismatched subItem URLs
          automationsSubItems: patched.find((m) => m.key === 'automations')?.subItems?.map((s) => ({
            url: s.url,
            normalized: normalizeRoute(s.url),
            can_view: s.permissions?.can_view,
          })),
        });
        set({
          modules: patched,
          lastFetched: now,
          isLoading: false,
          permissionsReady: true,
        });
        return;
      }

      set({
        modules: [],
        lastFetched: now,
        error: data?.error || data?.message || 'Failed to fetch modules',
        isLoading: false,
        permissionsReady: false,
      });
    } catch (error) {
      console.error('❌ Error fetching modules:', error);
      set({
        modules: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
        permissionsReady: false,
      });
    }
  },

  getModuleByKey: (key: string) => {
    const { modules } = get();
    return modules.find((module) => module.key === key);
  },

  getModuleByRoute: (route: string) => {
    const { modules } = get();
    const normalized = normalizeRoute(route);
    return modules.find((module) =>
      module.routes.some(
        (moduleRoute) =>
          normalized === normalizeRoute(moduleRoute) ||
          (moduleRoute !== '/' && normalized.startsWith(normalizeRoute(moduleRoute)))
      )
    );
  },

  hasPermission: (
    moduleKey: string,
    permission: keyof Module['permissions']
  ) => {
    const { modules, error, permissionsReady } = get();
    const moduleItem = modules.find((m) => m.key === moduleKey);

    // Fail-closed: if we couldn't load module permissions, don't expose protected UI.
    if (!permissionsReady || error || modules.length === 0) return false;

    return moduleItem ? moduleItem.permissions[permission] : false;
  },

  isModuleActive: (moduleKey: string) => {
    const { modules, error, permissionsReady } = get();

    // Fail-closed: if we couldn't load modules, treat as inactive.
    if (!permissionsReady || error || modules.length === 0) return false;

    return modules.some((module) => module.key === moduleKey);
  },

  isRouteAccessible: (route: string) => {
    const { modules, error, permissionsReady } = get();
    const normalized = normalizeRoute(route);

    // Fail-closed: if we couldn't load modules, treat as inaccessible.
    if (!permissionsReady || error || modules.length === 0) return false;

    const moduleItem = modules.find((m) =>
      m.routes.some((r) => {
        const mr = normalizeRoute(r);
        return normalized === mr || (mr !== '/' && normalized.startsWith(mr));
      })
    );

    if (!moduleItem) return false;
    if (!moduleItem.permissions.can_view) return false;

    // If this route maps to a sub-item that is explicitly denied, treat as inaccessible.
    const deniedSubItem = moduleItem.subItems?.find((s) => {
      const su = normalizeRoute(s.url);
      const canView = (s.permissions?.can_view ?? moduleItem.permissions.can_view) === true;
      return !canView && (normalized === su || (su !== '/' && normalized.startsWith(su)));
    });

    if (deniedSubItem) return false;
    return true;
  }
}));
