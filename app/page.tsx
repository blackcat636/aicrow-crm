export const runtime = 'edge';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { ModuleRouteGuard } from "@/components/auth/module-route-guard"
import { ModuleRenderer } from "@/components/modules/module-renderer"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--sidebar-width-mobile": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="overflow-x-hidden">
        <SiteHeader />
        <div className="flex flex-1 flex-col min-h-0">
          <div className="@container/main flex flex-1 flex-col gap-2 overflow-y-auto">
            <div className="flex flex-col gap-4 py-4 px-2 sm:px-4 md:gap-6 md:py-6 animate-fade-in-up">
              <ModuleRouteGuard moduleKey="dashboard">
                <ModuleRenderer moduleKey="dashboard" />
              </ModuleRouteGuard>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
