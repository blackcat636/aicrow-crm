"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RolesList } from '@/components/permissions/roles-list'
import { PermissionsList } from '@/components/permissions/permissions-list'
import { CreateRoleDialog } from '@/components/permissions/create-role-dialog'
import { CreatePermissionDialog } from '@/components/permissions/create-permission-dialog'
import { AddChildRoleDialog } from '@/components/permissions/add-child-role-dialog'
import { AddChildPermissionDialog } from '@/components/permissions/add-child-permission-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { deleteRole, removeChildRole } from '@/lib/api/roles'
import { deletePermission, removeChildPermission } from '@/lib/api/permissions'
import { useRolesStore } from '@/store/useRolesStore'
import { usePermissionsStore } from '@/store/usePermissionsStore'
import { Role } from '@/interface/Role'
import { Permission } from '@/interface/Permission'

export default function PermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [createRoleOpen, setCreateRoleOpen] = useState(false)
  const [createPermissionOpen, setCreatePermissionOpen] = useState(false)
  const [editRoleOpen, setEditRoleOpen] = useState(false)
  const [editPermissionOpen, setEditPermissionOpen] = useState(false)
  const [addChildRoleOpen, setAddChildRoleOpen] = useState(false)
  const [addChildPermissionOpen, setAddChildPermissionOpen] = useState(false)
  const [deleteRoleDialogOpen, setDeleteRoleDialogOpen] = useState(false)
  const [deletePermissionDialogOpen, setDeletePermissionDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null)
  const [childRoleToRemove, setChildRoleToRemove] = useState<{
    parent: Role
    child: Role
  } | null>(null)
  const [childPermissionToRemove, setChildPermissionToRemove] = useState<{
    parent: Permission
    child: Permission
  } | null>(null)

  const { fetchRoles, removeRoleFromStore } = useRolesStore()
  const { fetchPermissions, removePermissionFromStore } = usePermissionsStore()

  const handleCreateRole = () => {
    setSelectedRole(null)
    setCreateRoleOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    // Small delay to ensure DropdownMenu closes before Dialog opens
    setTimeout(() => {
      setEditRoleOpen(true)
    }, 0)
  }

  const handleDeleteRole = (role: Role) => {
    setRoleToDelete(role)
    setDeleteRoleDialogOpen(true)
  }

  const handleConfirmDeleteRole = async () => {
    if (!roleToDelete) return

    try {
      await deleteRole(roleToDelete.id)
      toast.success('Role deleted successfully')
      removeRoleFromStore(roleToDelete.id)
      setDeleteRoleDialogOpen(false)
      setRoleToDelete(null)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete role'
      toast.error(message)
    }
  }

  const handleAddChildRole = (role: Role) => {
    setSelectedRole(role)
    // Small delay to ensure DropdownMenu closes before Dialog opens
    setTimeout(() => {
      setAddChildRoleOpen(true)
    }, 0)
  }

  const handleRemoveChildRole = (parent: Role, child: Role) => {
    setChildRoleToRemove({ parent, child })
  }

  const handleConfirmRemoveChildRole = async () => {
    if (!childRoleToRemove) return

    try {
      await removeChildRole(
        childRoleToRemove.parent.id,
        childRoleToRemove.child.id
      )
      toast.success('Child role removed successfully')
      await fetchRoles()
      setChildRoleToRemove(null)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to remove child role'
      toast.error(message)
    }
  }

  const handleCreatePermission = () => {
    setSelectedPermission(null)
    setCreatePermissionOpen(true)
  }

  const handleEditPermission = (permission: Permission) => {
    setSelectedPermission(permission)
    // Small delay to ensure DropdownMenu closes before Dialog opens
    setTimeout(() => {
      setEditPermissionOpen(true)
    }, 0)
  }

  const handleDeletePermission = (permission: Permission) => {
    setPermissionToDelete(permission)
    setDeletePermissionDialogOpen(true)
  }

  const handleConfirmDeletePermission = async () => {
    if (!permissionToDelete) return

    try {
      await deletePermission(permissionToDelete.id)
      toast.success('Permission deleted successfully')
      removePermissionFromStore(permissionToDelete.id)
      setDeletePermissionDialogOpen(false)
      setPermissionToDelete(null)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete permission'
      toast.error(message)
    }
  }

  const handleAddChildPermission = (permission: Permission) => {
    setSelectedPermission(permission)
    // Small delay to ensure DropdownMenu closes before Dialog opens
    setTimeout(() => {
      setAddChildPermissionOpen(true)
    }, 0)
  }

  const handleRemoveChildPermission = (parent: Permission, child: Permission) => {
    setChildPermissionToRemove({ parent, child })
  }

  const handleConfirmRemoveChildPermission = async () => {
    if (!childPermissionToRemove) return

    try {
      await removeChildPermission(
        childPermissionToRemove.parent.id,
        childPermissionToRemove.child.id
      )
      toast.success('Child permission removed successfully')
      await fetchPermissions()
      setChildPermissionToRemove(null)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to remove child permission'
      toast.error(message)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 px-6 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Roles & Permissions Management</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage roles and access permissions
            </p>
          </div>
        </div>

        <Tabs defaultValue="roles" className="w-full">
          <TabsList>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="mt-4">
            <RolesList
              onCreateRole={handleCreateRole}
              onEditRole={handleEditRole}
              onDeleteRole={handleDeleteRole}
              onAddChildRole={handleAddChildRole}
              onRemoveChildRole={handleRemoveChildRole}
            />
          </TabsContent>

          <TabsContent value="permissions" className="mt-4">
            <PermissionsList
              onCreatePermission={handleCreatePermission}
              onEditPermission={handleEditPermission}
              onDeletePermission={handleDeletePermission}
              onAddChildPermission={handleAddChildPermission}
              onRemoveChildPermission={handleRemoveChildPermission}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CreateRoleDialog
        open={createRoleOpen}
        onOpenChange={setCreateRoleOpen}
      />
      <CreateRoleDialog
        role={selectedRole}
        open={editRoleOpen}
        onOpenChange={(open) => {
          setEditRoleOpen(open)
          if (!open) {
            // Clear selected role when dialog closes to prevent stale state
            setSelectedRole(null)
          }
        }}
      />
      <CreatePermissionDialog
        open={createPermissionOpen}
        onOpenChange={setCreatePermissionOpen}
      />
      <CreatePermissionDialog
        permission={selectedPermission}
        open={editPermissionOpen}
        onOpenChange={(open) => {
          setEditPermissionOpen(open)
          if (!open) {
            // Clear selected permission when dialog closes to prevent stale state
            setSelectedPermission(null)
          }
        }}
      />
      <AddChildRoleDialog
        parentRole={selectedRole}
        open={addChildRoleOpen}
        onOpenChange={(open) => {
          setAddChildRoleOpen(open)
          if (!open) {
            // Clear selected role when dialog closes to prevent stale state
            setSelectedRole(null)
          }
        }}
      />
      <AddChildPermissionDialog
        parentPermission={selectedPermission}
        open={addChildPermissionOpen}
        onOpenChange={(open) => {
          setAddChildPermissionOpen(open)
          if (!open) {
            // Clear selected permission when dialog closes to prevent stale state
            setSelectedPermission(null)
          }
        }}
      />

      {/* Delete confirmation dialogs */}
      <AlertDialog open={deleteRoleDialogOpen} onOpenChange={setDeleteRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role &quot;{roleToDelete?.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteRole}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deletePermissionDialogOpen}
        onOpenChange={setDeletePermissionDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permission?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the permission &quot;{permissionToDelete?.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeletePermission}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove child confirmation dialogs */}
      {childRoleToRemove && (
        <AlertDialog
          open={!!childRoleToRemove}
          onOpenChange={(open) => !open && setChildRoleToRemove(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Child Role?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove the relationship between role &quot;{childRoleToRemove.parent.name}&quot; and &quot;{childRoleToRemove.child.name}&quot;?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setChildRoleToRemove(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmRemoveChildRole}>
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {childPermissionToRemove && (
        <AlertDialog
          open={!!childPermissionToRemove}
          onOpenChange={(open) => !open && setChildPermissionToRemove(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Child Permission?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove the relationship between permission &quot;{childPermissionToRemove.parent.name}&quot; and &quot;{childPermissionToRemove.child.name}&quot;?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setChildPermissionToRemove(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmRemoveChildPermission}>
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
