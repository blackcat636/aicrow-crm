import type { Module } from "@/interface/Module";

export type ModulePermissionKey = "can_view" | "can_edit" | "can_delete";

export const normalizePathname = (raw: string) => {
  const base = raw.split("#")[0].split("?")[0].trim();
  if (base === "/") return "/";
  return base.replace(/\/+$/, "");
};

type RouteDependency = {
  pathPrefix: string;
  requires: Array<{ moduleKey: string; permission: ModulePermissionKey }>;
};

// Central place for cross-module route requirements.
// Keep this list small and high-signal: only for routes that require access to another module
// to be usable (e.g., Admin Deposit requires Users list access to select a user).
const ROUTE_DEPENDENCIES: RouteDependency[] = [
  {
    pathPrefix: "/balance/admin-deposit",
    requires: [{ moduleKey: "users", permission: "can_view" }]
  }
];

export const areRouteDependenciesMet = (
  pathname: string,
  hasPermission: (moduleKey: string, permission: ModulePermissionKey) => boolean
) => {
  const normalized = normalizePathname(pathname);
  const matched = ROUTE_DEPENDENCIES.filter((d) => {
    const prefix = normalizePathname(d.pathPrefix);
    return normalized === prefix || normalized.startsWith(`${prefix}/`);
  });

  if (matched.length === 0) return true;

  for (const dep of matched) {
    for (const req of dep.requires) {
      if (!hasPermission(req.moduleKey, req.permission)) {
        return false;
      }
    }
  }

  return true;
};

export const pickFirstAccessiblePath = (
  modules: Module[],
  canAccessPath?: (pathname: string) => boolean
): string | null => {
  const sorted = [...modules].sort((a, b) => a.order - b.order);

  const pickFrom = (mods: Module[]) => {
    for (const m of mods) {
      if (!m.permissions?.can_view) continue;

      if (m.subItems?.length) {
        const firstVisibleSub = m.subItems.find(
          (s) => (s.permissions?.can_view ?? m.permissions.can_view) === true
        );
        if (firstVisibleSub?.url) {
          const candidate = normalizePathname(firstVisibleSub.url);
          if (!canAccessPath || canAccessPath(candidate)) return candidate;
        }
      }

      const firstRoute = m.routes?.[0];
      if (firstRoute) {
        const candidate = normalizePathname(firstRoute);
        if (!canAccessPath || canAccessPath(candidate)) return candidate;
      }
    }
    return null;
  };

  // Prefer menu modules first (closest to what user can actually click).
  const fromMenu = pickFrom(sorted.filter((m) => m.menu));
  if (fromMenu) return fromMenu;

  // Fallback to any accessible module route.
  return pickFrom(sorted);
};

