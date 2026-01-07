"use client"

import { useEffect } from 'react'
import { usePermissionsStore } from '@/store/usePermissionsStore'
import { Permission } from '@/interface/Permission'
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

interface PermissionsListProps {
  onCreatePermission: () => void
  onEditPermission: (permission: Permission) => void
  onDeletePermission: (permission: Permission) => void
  onAddChildPermission: (permission: Permission) => void
  onRemoveChildPermission: (permission: Permission, childPermission: Permission) => void
}

export function PermissionsList({
  onCreatePermission,
  onEditPermission,
  onDeletePermission,
  onAddChildPermission,
  onRemoveChildPermission,
}: PermissionsListProps) {
  const { permissions, isLoading, error, fetchPermissions } = usePermissionsStore()

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Permissions</h2>
        <Button onClick={onCreatePermission}>
          <IconPlus className="mr-2 h-4 w-4" />
          Create Permission
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Child Permissions</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No permissions found
              </TableCell>
            </TableRow>
          ) : (
            permissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell>{permission.id}</TableCell>
                <TableCell className="font-medium">{permission.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{permission.resource}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{permission.action}</Badge>
                </TableCell>
                <TableCell>{permission.description}</TableCell>
                <TableCell>
                  <Badge variant={permission.isActive !== false ? 'default' : 'secondary'}>
                    {permission.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {permission.children && permission.children.length > 0 ? (
                    <div className="space-y-1">
                      {permission.children.map((child: Permission) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span>{child.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onRemoveChildPermission(permission, child)}
                            title="Remove child permission"
                          >
                            <IconX className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No child permissions
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditPermission(permission)}>
                        <IconEdit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAddChildPermission(permission)}>
                        <IconHierarchy className="mr-2 h-4 w-4" />
                        Add Child Permission
                      </DropdownMenuItem>
                      {!permission.isSystem && (
                        <DropdownMenuItem
                          onClick={() => onDeletePermission(permission)}
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
