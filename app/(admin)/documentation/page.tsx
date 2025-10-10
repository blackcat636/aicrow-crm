"use client"

import { useState } from 'react';
import { ModuleRouteGuard } from '@/components/auth/module-route-guard';
import { useModulePermission } from '@/components/auth/module-route-guard';

export default function DocumentationPage() {
  const { canView } = useModulePermission('documentation');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Documentation</h1>
              <p className="text-muted-foreground">
                API documentation and guides
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 pb-2 md:gap-6 md:pb-3">
            <div className="relative" style={{ width: '100%', height: 'calc(100vh - 200px)' }}>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <div className="text-sm text-muted-foreground">Loading documentation...</div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <div className="text-center p-6">
                    <div className="text-red-500 mb-2">⚠️</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Failed to load documentation
                    </div>
                    <button 
                      onClick={() => {
                        setError(null);
                        setLoading(true);
                        // Force iframe reload
                        const iframe = document.getElementById('docs-iframe') as HTMLIFrameElement;
                        if (iframe) {
                          iframe.src = iframe.src;
                        }
                      }}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
              
              <iframe
                id="docs-iframe"
                src="/api/documentation-proxy"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  opacity: loading ? 0 : 1,
                }}
                onLoad={() => {
                  console.log('Documentation iframe loaded successfully');
                  setLoading(false);
                }}
                onError={(e) => {
                  console.error('Documentation iframe error:', e);
                  setError('Failed to load documentation');
                  setLoading(false);
                }}
                title="API Documentation"
              />
            </div>
          </div>
        </div>
      </div>
    </ModuleRouteGuard>
  );
}
