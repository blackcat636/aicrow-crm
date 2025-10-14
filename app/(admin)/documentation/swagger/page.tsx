"use client"

import React from 'react';
import { ModuleRouteGuard } from '@/components/auth/module-route-guard';
import { useModulePermission } from '@/components/auth/module-route-guard';

export default function DocumentationSwaggerPage() {
  const { canView } = useModulePermission('documentation');

  if (!canView) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-sm text-muted-foreground">
          You don&apos;t have permission to view the Documentation module
        </div>
      </div>
    );
  }

  return (
    <ModuleRouteGuard moduleKey="documentation" requiredPermission="can_view">
      <div className="flex flex-1 flex-col h-full">
        {/* Swagger via backend-proxied iframe */}
        <iframe
          src="/api/docs"
          style={{ width: '100%', height: '100vh', border: 'none' }}
        />
      </div>
    </ModuleRouteGuard>
  );
}


