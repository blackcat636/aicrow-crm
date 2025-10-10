"use client"

import * as React from "react"
import {
  IconCalendar,
  IconCamera,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconMapPin,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconBrandX,
  IconCar,
  IconPalette,
  IconCategory,
  type Icon,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
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
  IconDashboard,
  IconListDetails,
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconFileDescription,
  IconBrandX,
  IconCar,
  IconPalette,
  IconCategory,
  IconSettings,
};

// Convert module to nav item format
const convertModuleToNavItem = (module: Module) => {
  const IconComponent = iconMap[module.icon] || IconListDetails;
  
  return {
    title: module.name,
    url: module.routes[0] || '/',
    icon: IconComponent,
    items: module.subItems?.map(subItem => ({
      title: subItem.title,
      url: subItem.url,
    })),
  };
};

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

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
                <span className="text-base font-semibold">Uncar</span>
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
            <NavDocuments items={data.documents} />
            <NavSecondary items={data.navSecondary} className="mt-auto" />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
    </Sidebar>
  )
}
