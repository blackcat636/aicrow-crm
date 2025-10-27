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
  type Icon,
} from "@tabler/icons-react"

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

// Icon mapping for dynamic modules
const iconMap: Record<string, Icon> = {
  IconListDetails,
  IconUsers,
  IconFileDescription,
  IconSettings,
  IconCoins,
  IconHistory,
};

// Convert module to nav item format
const convertModuleToNavItem = (module: Module) => {
  const IconComponent = iconMap[module.icon] || IconListDetails;
  
  const items = module.subItems?.map(subItem => ({
      title: subItem.title,
      url: subItem.url,
    })) || [];

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
  const { modules, fetchModules, isLoading } = useModulesStore();

  // Fetch modules on component mount
  React.useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Convert modules to nav items, sorted by order
  const navMain = modules
    .filter(module => module.menu)
    .sort((a, b) => a.order - b.order)
    .map(convertModuleToNavItem);

  // Debug logging
  React.useEffect(() => {
    // Modules and nav items are ready
  }, [modules, navMain]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">AiPills CRM</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="text-sm text-muted-foreground">Loading modules...</div>
          </div>
        ) : (
          <>
            <NavMain items={navMain} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
    </Sidebar>
  )
}
