"use client"

import React from 'react';
import { ModuleRouteGuard } from '@/components/auth/module-route-guard';
import { useModulePermission } from '@/components/auth/module-route-guard';
import InteractiveDocumentation from '@/components/documentation/interactive-documentation';

export default function InteractiveDocumentationPage() {
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
        <InteractiveDocumentation />
      </div>
    </ModuleRouteGuard>
  );
}


