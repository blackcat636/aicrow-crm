"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const STORAGE_KEY = "last_path";
const COOKIE_NAME = "last_path";

const isTrackablePath = (path: string) => {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("/login")) return false;
  if (path.startsWith("/api")) return false;
  if (path.startsWith("/_next")) return false;
  return true;
};

const buildFullPath = (pathname: string, searchParams: URLSearchParams) => {
  const qs = searchParams.toString();
  return qs ? `${pathname}?${qs}` : pathname;
};

export function LastPathTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    if (!isTrackablePath(pathname)) return;

    const fullPath = buildFullPath(pathname, searchParams);

    try {
      window.localStorage.setItem(STORAGE_KEY, fullPath);
    } catch {
      // Ignore storage errors.
    }

    // Also persist as a cookie so server-side / middleware can use it if needed.
    // Cookie value must be encoded.
    const encoded = encodeURIComponent(fullPath);
    document.cookie = `${COOKIE_NAME}=${encoded}; path=/; max-age=2592000; samesite=strict`;
  }, [pathname, searchParams]);

  return null;
}

