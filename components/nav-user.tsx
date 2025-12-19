"use client"

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useSidebar,
} from "@/components/ui/sidebar"
import { useUserStore } from "@/store/useUserStore"
import { logout } from "@/lib/api"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user } = useUserStore()
  // const router = useRouter()

  const handleLogout = async () => {
    await logout()
  }

  if (!user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg p-2 w-full">
          <Avatar className="">
            <AvatarFallback className="bg-gradient-primary text-white font-semibold">
              {user.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!isMobile && (
            <span className="text-sm font-medium flex-1 text-left">
              {user.username}
            </span>
          )}
          <IconDotsVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 animate-fade-in-up">
        <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <IconUserCircle className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <IconCreditCard className="mr-2 h-4 w-4" />
            <span>Payments</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <IconNotification className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <IconLogout className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
