"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useModulesStore } from "@/store/useModulesStore";
import { areRouteDependenciesMet, normalizePathname, pickFirstAccessiblePath } from "@/lib/access-navigation";

export default function BalanceIndexRedirectPage() {
  const router = useRouter();
  const { modules, fetchModules, isLoading, permissionsReady, isRouteAccessible, hasPermission, getModuleByKey } =
    useModulesStore();

  useEffect(() => {
    if (modules.length === 0 && !isLoading) {
      fetchModules();
    }
  }, [modules.length, isLoading, fetchModules]);

  useEffect(() => {
    if (isLoading || !permissionsReady || modules.length === 0) return;

    const balance = getModuleByKey("balance");
    const candidates =
      balance?.subItems
        ?.map((s) => normalizePathname(s.url))
        .filter((p) => isRouteAccessible(p) && areRouteDependenciesMet(p, hasPermission)) ?? [];

    const fallback = pickFirstAccessiblePath(modules, (p) => isRouteAccessible(p) && areRouteDependenciesMet(p, hasPermission));
    const target = candidates[0] || fallback || "/documentation";

    // Avoid accidental loops.
    if (normalizePathname(target) === "/balance") {
      router.replace("/documentation");
      return;
    }

    router.replace(target);
  }, [isLoading, permissionsReady, modules, isRouteAccessible, hasPermission, getModuleByKey, router]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-sm text-muted-foreground">Redirecting...</div>
    </div>
  );
}

