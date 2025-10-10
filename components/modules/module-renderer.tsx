"use client"

import dynamic from 'next/dynamic';
import { useModulesStore } from '@/store/useModulesStore';
import { Module } from '@/interface/Module';

// Dynamic imports for module components
const moduleComponents = {
  dashboard: dynamic(() => import('@/modules/dashboard').catch(() => ({ default: () => <div>Dashboard module not available</div> }))),
  cars: dynamic(() => import('@/app/(admin)/cars/page').catch(() => ({ default: () => <div>Cars module not available</div> }))),
  bookings: dynamic(() => import('@/app/(admin)/bookings/page').catch(() => ({ default: () => <div>Bookings module not available</div> }))),
  locations: dynamic(() => import('@/app/(admin)/locations/page').catch(() => ({ default: () => <div>Locations module not available</div> }))),
  users: dynamic(() => import('@/app/(admin)/users/page').catch(() => ({ default: () => <div>Users module not available</div> }))),
  documentation: dynamic(() => import('@/app/(admin)/documentation/page').catch(() => ({ default: () => <div>Documentation module not available</div> }))),
};

interface ModuleRendererProps {
  moduleKey: string;
  fallback?: React.ReactNode;
}

export function ModuleRenderer({ moduleKey, fallback }: ModuleRendererProps) {
  const { isModuleActive, hasPermission } = useModulesStore();

  // Check if module is active
  if (!isModuleActive(moduleKey)) {
    return fallback || <div>Module {moduleKey} is not available</div>;
  }

  // Check if user has view permission
  if (!hasPermission(moduleKey, 'can_view')) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-sm text-muted-foreground">
          You don&apos;t have permission to view this module
        </div>
      </div>
    );
  }

  // Get the component for this module
  const ModuleComponent = moduleComponents[moduleKey as keyof typeof moduleComponents];

  if (!ModuleComponent) {
    return fallback || <div>Module component not found for {moduleKey}</div>;
  }

  return <ModuleComponent />;
}

interface ModuleDashboardProps {
  className?: string;
}

export function ModuleDashboard({ className }: ModuleDashboardProps) {
  const { modules, isLoading } = useModulesStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-sm text-muted-foreground">Loading modules...</div>
      </div>
    );
  }

  // Filter modules that should be displayed on dashboard
  const dashboardModules = modules.filter(module => 
    module.menu && 
    module.permissions.can_view &&
    module.key !== 'dashboard' // Exclude dashboard itself
  );

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardModules.map((module) => (
          <ModuleCard key={module.key} module={module} />
        ))}
      </div>
    </div>
  );
}

interface ModuleCardProps {
  module: Module;
}

function ModuleCard({ module }: ModuleCardProps) {
  const IconComponent = moduleComponents[module.icon as keyof typeof moduleComponents] || null;

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-4">
        {IconComponent && <IconComponent />}
        <h3 className="text-lg font-semibold">{module.name}</h3>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          Routes: {module.routes.join(', ')}
        </div>
        
        <div className="flex space-x-2">
          {module.permissions.can_view && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              View
            </span>
          )}
          {module.permissions.can_edit && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              Edit
            </span>
          )}
          {module.permissions.can_delete && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
              Delete
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for module-specific functionality
export function useModule(moduleKey: string) {
  const { getModuleByKey, hasPermission, isModuleActive } = useModulesStore();
  
  const moduleData = getModuleByKey(moduleKey);
  
  return {
    module: moduleData,
    isActive: isModuleActive(moduleKey),
    canView: hasPermission(moduleKey, 'can_view'),
    canEdit: hasPermission(moduleKey, 'can_edit'),
    canDelete: hasPermission(moduleKey, 'can_delete'),
    routes: moduleData?.routes || [],
    subItems: moduleData?.subItems || [],
  };
}
