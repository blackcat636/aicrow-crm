"use client"

import * as React from "react"
import {
  IconFileDescription,
  IconInnerShadowTop,
  IconListDetails,
  IconSettings,
  IconUsers,
  IconCoins,
  IconHistory,
  IconShield,
  IconCreditCard,
  type Icon,
} from "@tabler/icons-react"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useModulesStore } from "@/store/useModulesStore"
import { Module } from "@/interface/Module"
import { areRouteDependenciesMet } from "@/lib/access-navigation"

// Icon mapping for dynamic modules
const iconMap: Record<string, Icon> = {
  IconListDetails,
  IconUsers,
  IconFileDescription,
  IconSettings,
  IconCoins,
  IconHistory,
  IconShield,
  IconCreditCard,
};

// Convert module to nav item format
const convertModuleToNavItem = (
  module: Module,
  opts: {
    getModuleByRoute: (route: string) => Module | undefined;
    hasPermission: (moduleKey: string, permission: keyof Module["permissions"]) => boolean;
    isRouteAccessible: (route: string) => boolean;
  }
) => {
  const IconComponent = iconMap[module.icon] || IconListDetails;
  
  const items =
    module.subItems
      ?.filter((subItem) => {
        // If route dependencies are not met, hide the sub-item entirely.
        if (!opts.isRouteAccessible(subItem.url)) {
          return false;
        }
        if (!areRouteDependenciesMet(subItem.url, (k, p) => opts.hasPermission(k, p))) {
          return false;
        }

        // Prefer explicit sub-item permissions if present.
        if (subItem.permissions?.can_view === false) {
          return false;
        }
        if (subItem.permissions?.can_view === true) {
          return true;
        }

        // Fallback: if sub-item route belongs to another module, respect that module's view permission.
        const targetModule = opts.getModuleByRoute(subItem.url);
        if (!targetModule) {
          return true;
        }
        return opts.hasPermission(targetModule.key, "can_view");
      })
      .map((subItem) => ({
      title: subItem.title,
      url: subItem.url,
    })) || [];

  // If module is configured with sub-items but none are visible, hide the module entirely.
  // This prevents rendering a broken top-level link (e.g. /workflows) that leads to 403.
  if (module.subItems?.length && items.length === 0) {
    return null;
  }

  // Inject additional sub-items under Documentation
  if (module.key === 'documentation') {
    const hasInteractive = items.some(i => i.url === '/documentation');
    if (!hasInteractive) {
      items.push({ title: 'Documentation', url: '/documentation' });
    }
    const hasSwagger = items.some(i => i.url === '/documentation/swagger');
    if (!hasSwagger) {
      items.push({ title: 'Swagger', url: '/documentation/swagger' });
    }
  }

  return {
    title: module.name,
    url: module.routes[0] || '/',
    icon: IconComponent,
    items,
  };
};


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { modules, fetchModules, isLoading, permissionsReady, hasPermission, getModuleByRoute, isRouteAccessible } = useModulesStore();

  // Fetch modules on component mount
  React.useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Convert modules to nav items, sorted by order
  const navMain = modules
    .filter((module) => module.menu && hasPermission(module.key, "can_view"))
    .sort((a, b) => a.order - b.order)
    .map((module) => convertModuleToNavItem(module, { getModuleByRoute, hasPermission, isRouteAccessible }))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    console.debug("[sidebar] menu computed", {
      modulesCount: modules.length,
      navMainCount: navMain.length,
      isLoading,
      keys: modules.map((m) => m.key),
    });
  }, [modules, navMain, isLoading]);

  return (
    <Sidebar collapsible="offcanvas" {...props} className="border-r border-sidebar-border/50 backdrop-blur-xl dark:bg-[#031138]/70 dark:backdrop-blur-xl">
      <div data-slot="sidebar-unified" className="flex h-full w-full flex-col">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="animate-fade-in-up">
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5 hover-lift group relative overflow-hidden"
              >
                <Link href="/users">
                  <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  <IconInnerShadowTop className="!size-5 transition-transform group-hover:scale-110 duration-300" />
                  <span className="text-base font-semibold bg-gradient-to-r from-sidebar-foreground to-sidebar-primary bg-clip-text">
                    AiPills CRM
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {isLoading || !permissionsReady ? (
            <div className="flex items-center justify-center p-4 animate-pulse">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <div className="text-sm text-muted-foreground">Loading permissions...</div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              <NavMain items={navMain} />
            </div>
          )}
        </SidebarContent>
        <SidebarFooter>
          <div className="animate-fade-in-up">
            <NavUser/>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  )
}
