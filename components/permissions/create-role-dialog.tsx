"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { createRole, updateRole } from '@/lib/api/roles'
import { useRolesStore } from '@/store/useRolesStore'
import { usePermissionsStore } from '@/store/usePermissionsStore'
import { Role } from '@/interface/Role'

interface CreateRoleDialogProps {
  role?: Role | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateRoleDialog({
  role,
  open: controlledOpen,
  onOpenChange,
}: CreateRoleDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { fetchRoles } = useRolesStore()
  const { permissions, fetchPermissions } = usePermissionsStore()

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when closing - use setTimeout to ensure state updates after dialog closes
      setTimeout(() => {
        resetForm()
      }, 100)
    }
    if (onOpenChange) {
      onOpenChange(open)
    } else {
      setInternalOpen(open)
    }
  }
  const isEditMode = !!role

  // Get selected permission IDs from role.rolePermissions
  const getInitialPermissionIds = (): number[] => {
    if (role?.rolePermissions) {
      return role.rolePermissions.map((rp) => rp.permissionId)
    }
    return []
  }

  const [form, setForm] = useState({
    name: role?.name || '',
    description: role?.description || '',
    permissionIds: getInitialPermissionIds(),
    conditions: role?.rolePermissions?.[0]?.conditions || null,
  })

  const [conditionsJson, setConditionsJson] = useState(
    form.conditions ? JSON.stringify(form.conditions, null, 2) : ''
  )

  const [errors, setErrors] = useState<{
    name?: string
    description?: string
    conditions?: string
  }>({})

  useEffect(() => {
    if (isOpen && !isEditMode) {
      fetchPermissions()
    }
  }, [isOpen, isEditMode, fetchPermissions])

  // Reset form when role changes or dialog opens (e.g., when switching from edit to create mode)
  useEffect(() => {
    if (isOpen) {
      const permissionIds = role?.rolePermissions
        ? role.rolePermissions.map((rp) => rp.permissionId)
        : []
      setForm({
        name: role?.name || '',
        description: role?.description || '',
        permissionIds,
        conditions: role?.rolePermissions?.[0]?.conditions || null,
      })
      setConditionsJson(
        role?.rolePermissions?.[0]?.conditions
          ? JSON.stringify(role.rolePermissions[0].conditions, null, 2)
          : ''
      )
      setErrors({})
    }
  }, [role, isOpen])

  const validate = (): boolean => {
    const newErrors: { name?: string; description?: string; conditions?: string } = {}
    if (!form.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!form.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (conditionsJson.trim()) {
      try {
        JSON.parse(conditionsJson)
      } catch {
        newErrors.conditions = 'Invalid JSON format'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setForm({
      name: role?.name || '',
      description: role?.description || '',
      permissionIds: getInitialPermissionIds(),
      conditions: role?.rolePermissions?.[0]?.conditions || null,
    })
    setConditionsJson(
      role?.rolePermissions?.[0]?.conditions
        ? JSON.stringify(role.rolePermissions[0].conditions, null, 2)
        : ''
    )
    setErrors({})
  }

  const handlePermissionToggle = (permissionId: number) => {
    setForm((f) => ({
      ...f,
      permissionIds: f.permissionIds.includes(permissionId)
        ? f.permissionIds.filter((id) => id !== permissionId)
        : [...f.permissionIds, permissionId],
    }))
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      setIsSubmitting(true)

      // Parse conditions if provided
      let parsedConditions = null
      if (conditionsJson.trim()) {
        try {
          parsedConditions = JSON.parse(conditionsJson)
        } catch {
          toast.error('Invalid JSON in conditions field')
          setIsSubmitting(false)
          return
        }
      }

      const requestData: {
        name: string;
        description: string;
        permissionIds?: number[];
        conditions?: Record<string, unknown> | null;
      } = {
        name: form.name.trim(),
        description: form.description.trim(),
      }

      // Only include permissionIds if there are any selected
      if (form.permissionIds.length > 0) {
        requestData.permissionIds = form.permissionIds
      }

      // Only include conditions if provided
      if (parsedConditions) {
        requestData.conditions = parsedConditions
      }

      if (isEditMode && role) {
        await updateRole(role.id, requestData)
        toast.success('Role updated successfully')
      } else {
        await createRole(requestData)
        toast.success('Role created successfully')
      }
      setIsSubmitting(false)
      // Close dialog first, then fetch data
      handleOpenChange(false)
      // Fetch roles after closing dialog to avoid blocking UI
      setTimeout(async () => {
        await fetchRoles()
      }, 150)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save role'
      toast.error(message)
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline">Create Role</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Role' : 'Create New Role'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update role information'
              : 'Fill in the fields to create a new role'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="regional_manager"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Manages resources in assigned region"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Permissions</Label>
            <div className="h-48 overflow-y-auto rounded-md border p-4">
              <div className="space-y-2">
                {permissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No permissions available
                  </p>
                ) : (
                  permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`permission-${permission.id}`}
                        checked={form.permissionIds.includes(permission.id)}
                        onCheckedChange={() =>
                          handlePermissionToggle(permission.id)
                        }
                      />
                      <Label
                        htmlFor={`permission-${permission.id}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{permission.name}</span>
                          <span className="text-muted-foreground">
                            ({permission.resource}.{permission.action})
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
            {form.permissionIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {form.permissionIds.length} permission(s) selected
              </p>
            )}
          </div>

          {/* Conditions field hidden per user request */}
          {/* <div className="grid gap-2">
            <Label htmlFor="conditions">Conditions (JSON, optional)</Label>
            <Textarea
              id="conditions"
              placeholder='{"resourceFilter": {"location.region": "user.assignedRegion"}}'
              value={conditionsJson}
              onChange={(e) => {
                setConditionsJson(e.target.value)
                try {
                  if (e.target.value.trim()) {
                    const parsed = JSON.parse(e.target.value)
                    setForm((f) => ({ ...f, conditions: parsed }))
                  } else {
                    setForm((f) => ({ ...f, conditions: null }))
                  }
                } catch {
                  // Invalid JSON, will be caught in validation
                }
              }}
              className="font-mono text-sm"
              rows={4}
            />
            {errors.conditions && (
              <p className="text-xs text-red-500">{errors.conditions}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional: Define resource filters and conditions for this role
            </p>
          </div> */}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
                ? 'Update'
                : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
