"use client"

import React from 'react';
import { ModuleRouteGuard } from '@/components/auth/module-route-guard';
import { useModulePermission } from '@/components/auth/module-route-guard';
import InteractiveDocumentation from '@/components/documentation/interactive-documentation';

export default function DocumentationPage() {
  const { canView } = useModulePermission('documentation');

  // Log authentication status
  React.useEffect(() => {
    console.log('🔐 Documentation page loaded');
    console.log('🔐 Can view documentation:', canView);
    
    // Check if access token exists in cookies
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];
    
    console.log('🔑 Access token present:', !!token);
    if (token) {
      console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    }
  }, [canView]);

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
      <InteractiveDocumentation />
    </ModuleRouteGuard>
  );
}
