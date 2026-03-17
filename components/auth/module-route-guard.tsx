"use client"

import { useModulesStore } from '@/store/useModulesStore';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { areRouteDependenciesMet, normalizePathname, pickFirstAccessiblePath } from '@/lib/access-navigation';
import { NoAccess } from '@/components/common/no-access';

interface ModuleRouteGuardProps {
  children: React.ReactNode;
  moduleKey?: string;
  requiredPermission?: 'can_view' | 'can_edit' | 'can_delete';
  redirectOnDeny?: boolean;
}

export function ModuleRouteGuard({ 
  children, 
  moduleKey, 
  requiredPermission = 'can_view',
  redirectOnDeny = true,
}: ModuleRouteGuardProps) {
  const { 
    modules, 
    fetchModules, 
    isLoading,
    permissionsReady,
    isRouteAccessible, 
    hasPermission,
    getModuleByRoute 
  } = useModulesStore();
  
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const lastRedirectTo = useRef<string | null>(null);

  useEffect(() => {
    // Fetch modules if not loaded
    if (modules.length === 0 && !isLoading) {
      fetchModules();
    }
  }, [modules.length, isLoading, fetchModules]);

  useEffect(() => {
    if (isLoading || !permissionsReady || modules.length === 0) {
      return;
    }

    // Check if route is accessible
    const routeAccessible =
      isRouteAccessible(pathname) &&
      areRouteDependenciesMet(pathname, hasPermission);
    
    if (!routeAccessible) {
      if (redirectOnDeny) {
        const target = pickFirstAccessiblePath(modules, (p) =>
          isRouteAccessible(p) && areRouteDependenciesMet(p, hasPermission)
        ) ?? "/documentation";
        const normalizedTarget = normalizePathname(target);
        const normalizedCurrent = normalizePathname(pathname);
        if (normalizedTarget !== normalizedCurrent && lastRedirectTo.current !== normalizedTarget) {
          lastRedirectTo.current = normalizedTarget;
          router.replace(normalizedTarget);
          return;
        }
      }
      setIsAuthorized(false);
      return;
    }

    // If moduleKey is provided, check specific module permissions
    if (moduleKey) {
      const hasRequiredPermission = hasPermission(moduleKey, requiredPermission);
      if (!hasRequiredPermission && redirectOnDeny) {
        const target = pickFirstAccessiblePath(modules, (p) =>
          isRouteAccessible(p) && areRouteDependenciesMet(p, hasPermission)
        ) ?? "/documentation";
        const normalizedTarget = normalizePathname(target);
        const normalizedCurrent = normalizePathname(pathname);
        if (normalizedTarget !== normalizedCurrent && lastRedirectTo.current !== normalizedTarget) {
          lastRedirectTo.current = normalizedTarget;
          router.replace(normalizedTarget);
          return;
        }
      }
      setIsAuthorized(hasRequiredPermission);
      return;
    }

    // Otherwise, check permissions for the module that handles this route
    const moduleData = getModuleByRoute(pathname);
    if (moduleData) {
      const hasRequiredPermission = hasPermission(moduleData.key, requiredPermission);
      if (!hasRequiredPermission && redirectOnDeny) {
        const target = pickFirstAccessiblePath(modules, (p) =>
          isRouteAccessible(p) && areRouteDependenciesMet(p, hasPermission)
        ) ?? "/documentation";
        const normalizedTarget = normalizePathname(target);
        const normalizedCurrent = normalizePathname(pathname);
        if (normalizedTarget !== normalizedCurrent && lastRedirectTo.current !== normalizedTarget) {
          lastRedirectTo.current = normalizedTarget;
          router.replace(normalizedTarget);
          return;
        }
      }
      setIsAuthorized(hasRequiredPermission);
    } else {
      // If no specific module found, allow access (for routes like dashboard)
      setIsAuthorized(true);
    }
  }, [pathname, modules, isLoading, permissionsReady, moduleKey, requiredPermission, redirectOnDeny, isRouteAccessible, hasPermission, getModuleByRoute, router]);

  // Show loading state
  if (isLoading || !permissionsReady || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-sm text-muted-foreground">Checking permissions...</div>
      </div>
    );
  }

  // Show unauthorized state
  if (!isAuthorized) {
    return (
      <div className="flex flex-1 flex-col px-6 pb-6">
        <div className="flex-1 pt-6">
          <NoAccess
            title="No access"
            message="You don't have permission to access this page."
            note="Please contact an administrator to obtain access."
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component for protecting pages
export function withModuleGuard<P extends object>(
  Component: React.ComponentType<P>,
  moduleKey?: string,
  requiredPermission: 'can_view' | 'can_edit' | 'can_delete' = 'can_view'
) {
  return function ProtectedComponent(props: P) {
    return (
      <ModuleRouteGuard moduleKey={moduleKey} requiredPermission={requiredPermission}>
        <Component {...props} />
      </ModuleRouteGuard>
    );
  };
}

// Hook for checking module permissions in components
export function useModulePermission(moduleKey: string) {
  const { hasPermission, isModuleActive } = useModulesStore();
  
  return {
    canView: hasPermission(moduleKey, 'can_view'),
    canEdit: hasPermission(moduleKey, 'can_edit'),
    canDelete: hasPermission(moduleKey, 'can_delete'),
    isActive: isModuleActive(moduleKey),
  };
}
