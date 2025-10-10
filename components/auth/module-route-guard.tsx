"use client"

import { useModulesStore } from '@/store/useModulesStore';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';

interface ModuleRouteGuardProps {
  children: React.ReactNode;
  moduleKey?: string;
  requiredPermission?: 'can_view' | 'can_edit' | 'can_delete';
}

export function ModuleRouteGuard({ 
  children, 
  moduleKey, 
  requiredPermission = 'can_view' 
}: ModuleRouteGuardProps) {
  const { 
    modules, 
    fetchModules, 
    isLoading, 
    isRouteAccessible, 
    hasPermission,
    getModuleByRoute 
  } = useModulesStore();
  
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Fetch modules if not loaded
    if (modules.length === 0 && !isLoading) {
      fetchModules();
    }
  }, [modules.length, isLoading, fetchModules]);

  useEffect(() => {
    if (isLoading || modules.length === 0) {
      return;
    }

    // Check if route is accessible
    const routeAccessible = isRouteAccessible(pathname);
    
    if (!routeAccessible) {
      setIsAuthorized(false);
      return;
    }

    // If moduleKey is provided, check specific module permissions
    if (moduleKey) {
      const hasRequiredPermission = hasPermission(moduleKey, requiredPermission);
      setIsAuthorized(hasRequiredPermission);
      return;
    }

    // Otherwise, check permissions for the module that handles this route
    const module = getModuleByRoute(pathname);
    if (module) {
      const hasRequiredPermission = hasPermission(module.key, requiredPermission);
      setIsAuthorized(hasRequiredPermission);
    } else {
      // If no specific module found, allow access (for routes like dashboard)
      setIsAuthorized(true);
    }
  }, [pathname, modules, isLoading, moduleKey, requiredPermission, isRouteAccessible, hasPermission, getModuleByRoute]);

  // Show loading state
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-sm text-muted-foreground">Checking permissions...</div>
      </div>
    );
  }

  // Show unauthorized state
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-6xl">🚫</div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
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
