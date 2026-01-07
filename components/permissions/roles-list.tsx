"use client"

import { useEffect } from 'react'
import { useRolesStore } from '@/store/useRolesStore'
import { Role } from '@/interface/Role'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconHierarchy,
  IconX,
} from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconDotsVertical } from '@tabler/icons-react'

interface RolesListProps {
  onCreateRole: () => void
  onEditRole: (role: Role) => void
  onDeleteRole: (role: Role) => void
  onAddChildRole: (role: Role) => void
  onRemoveChildRole: (role: Role, childRole: Role) => void
}

export function RolesList({
  onCreateRole,
  onEditRole,
  onDeleteRole,
  onAddChildRole,
  onRemoveChildRole,
}: RolesListProps) {
  const { roles, isLoading, error, fetchRoles } = useRolesStore()

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Roles</h2>
        <Button onClick={onCreateRole}>
          <IconPlus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>System</TableHead>
            <TableHead>Child Roles</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No roles found
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.id}</TableCell>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <Badge variant={role.isActive ? 'default' : 'secondary'}>
                    {role.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {role.isSystem && (
                    <Badge variant="outline">System</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {(() => {
                    if (role.children && role.children.length > 0) {
                      return (
                        <div className="space-y-1">
                          {role.children.map((child: Role) => (
                            <div
                              key={child.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span>{child.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => onRemoveChildRole(role, child)}
                                title="Remove child role"
                              >
                                <IconX className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <span className="text-muted-foreground text-sm">
                        No child roles
                      </span>
                    );
                  })()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditRole(role)}>
                        <IconEdit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAddChildRole(role)}>
                        <IconHierarchy className="mr-2 h-4 w-4" />
                        Add Child Role
                      </DropdownMenuItem>
                      {!role.isSystem && (
                        <DropdownMenuItem
                          onClick={() => onDeleteRole(role)}
                          className="text-red-600"
                        >
                          <IconTrash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
