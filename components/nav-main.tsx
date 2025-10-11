"use client"

import { IconChevronRight, type Icon } from "@tabler/icons-react"
import { usePathname } from "next/navigation"
import React, { useState } from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Auto-expand menu if current path matches a sub-item
  React.useEffect(() => {
    const newExpandedItems: string[] = []
    items.forEach(item => {
      if (item.items) {
        const hasActiveSubItem = item.items.some(subItem => 
          pathname === subItem.url || (subItem.url !== '/' && pathname.startsWith(subItem.url))
        )
        if (hasActiveSubItem) {
          newExpandedItems.push(item.title)
        }
      }
    })
    setExpandedItems(newExpandedItems)
  }, [pathname, items])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => {
      const newItems = prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
      return newItems
    })
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url))
            const hasSubItems = item.items && item.items.length > 0
            
            if (hasSubItems) {
              const isExpanded = expandedItems.includes(item.title)
              
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={isActive}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleExpanded(item.title)
                    }}
                  >
                    {item.icon && <item.icon className="tabler-icon" />}
                    <span>{item.title}</span>
                    <IconChevronRight 
                      className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90' : ''
                      }`} 
                    />
                  </SidebarMenuButton>
                  {isExpanded && (
                    <SidebarMenuSub>
                      {item.items!.map((subItem) => {
                        const isSubActive = pathname === subItem.url || (subItem.url !== '/' && pathname.startsWith(subItem.url))
                        
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={isSubActive}>
                              <Link 
                                href={subItem.url}
                              >
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              )
            }
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link 
                    href={item.url}
                  >
                    {item.icon && <item.icon className="tabler-icon" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
