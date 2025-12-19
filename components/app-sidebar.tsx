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
          {isLoading ? (
            <div className="flex items-center justify-center p-4 animate-pulse">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <div className="text-sm text-muted-foreground">Loading modules...</div>
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
