"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ensureValidToken } from "@/lib/auth-utils";
import { getCookieValue } from "@/lib/auth";
import { useUserStore } from "@/store/useUserStore";
import { useModulesStore } from "@/store/useModulesStore";
import { areRouteDependenciesMet, normalizePathname, pickFirstAccessiblePath } from "@/lib/access-navigation";

const STORAGE_KEY = "last_path";

const safeInternalPath = (raw: string | null | undefined) => {
  if (!raw) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null;
  if (raw.startsWith("/login")) return null;
  if (raw.startsWith("/api")) return null;
  if (raw.includes("\n") || raw.includes("\r")) return null;
  return raw;
};

export function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserStore();
  const fetchModules = useModulesStore((s) => s.fetchModules);
  const [checked, setChecked] = useState(false);

  const returnTo = useMemo(() => safeInternalPath(searchParams.get("returnTo")), [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // If user is already in store, treat as authenticated.
      const hasUser = Boolean(user?.id);

      // If access token exists, consider authenticated (server will still enforce).
      const hasAccessToken = Boolean(getCookieValue("access_token"));

      // Try refresh if needed (uses refresh_token + device_id cookies).
      if (!hasUser && !hasAccessToken) {
        await ensureValidToken();
      }

      const nowHasToken = Boolean(getCookieValue("access_token"));
      const isAuthed = hasUser || hasAccessToken || nowHasToken;

      if (!isAuthed) {
        if (!cancelled) setChecked(true);
        return;
      }

      // Load modules so we can redirect to the nearest accessible page.
      await fetchModules();
      const modulesState = useModulesStore.getState();

      let lastPath: string | null = null;
      try {
        lastPath = safeInternalPath(window.localStorage.getItem(STORAGE_KEY));
      } catch {
        lastPath = null;
      }

      const candidates = [returnTo, lastPath].filter(Boolean) as string[];
      const accessibleCandidate = candidates.find((p) => {
        const pathname = normalizePathname(p);
        return (
          modulesState.isRouteAccessible(pathname) &&
          areRouteDependenciesMet(pathname, modulesState.hasPermission)
        );
      });

      const firstAccessible = pickFirstAccessiblePath(modulesState.modules, (p) =>
        modulesState.isRouteAccessible(p) && areRouteDependenciesMet(p, modulesState.hasPermission)
      );
      const target = accessibleCandidate || firstAccessible || "/documentation";

      if (!cancelled) {
        router.replace(target);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [router, user?.id, returnTo, fetchModules]);

  // While redirecting, hide the login UI to avoid flicker.
  if (!checked) return null;

  return null;
}

