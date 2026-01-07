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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createPermission, updatePermission } from '@/lib/api/permissions'
import { usePermissionsStore } from '@/store/usePermissionsStore'
import { useModulesStore } from '@/store/useModulesStore'
import { Permission } from '@/interface/Permission'

interface CreatePermissionDialogProps {
  permission?: Permission | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreatePermissionDialog({
  permission,
  open: controlledOpen,
  onOpenChange,
}: CreatePermissionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { fetchPermissions } = usePermissionsStore()
  const { modules, fetchModules } = useModulesStore()

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen

  // Fetch modules when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchModules()
    }
  }, [isOpen, fetchModules])

  // Get resources from modules (only main menu items, no submenus)
  const getResources = (): string[] => {
    const resources: string[] = []
    
    // Add only module keys as resources (main menu items only)
    modules
      .filter((module) => module.menu) // Only modules that are in menu
      .forEach((module) => {
        if (module.key && !resources.includes(module.key)) {
          resources.push(module.key)
        }
      })
    
    return resources.sort()
  }
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when closing
      resetForm()
    }
    if (onOpenChange) {
      onOpenChange(open)
    } else {
      setInternalOpen(open)
    }
  }
  const isEditMode = !!permission

  const [form, setForm] = useState({
    name: permission?.name || '',
    resource: permission?.resource || '',
    action: permission?.action || '',
    description: permission?.description || '',
  })

  const [errors, setErrors] = useState<{
    name?: string
    resource?: string
    action?: string
    description?: string
  }>({})

  const validate = (): boolean => {
    const newErrors: {
      name?: string
      resource?: string
      action?: string
      description?: string
    } = {}
    if (!form.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!form.resource.trim()) {
      newErrors.resource = 'Resource is required'
    }
    if (!form.action.trim()) {
      newErrors.action = 'Action is required'
    }
    if (!form.description.trim()) {
      newErrors.description = 'Description is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setForm({
      name: permission?.name || '',
      resource: permission?.resource || '',
      action: permission?.action || '',
      description: permission?.description || '',
    })
    setErrors({})
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      setIsSubmitting(true)
      if (isEditMode && permission) {
        await updatePermission(permission.id, form)
        toast.success('Permission updated successfully')
      } else {
        await createPermission(form)
        toast.success('Permission created successfully')
      }
      setIsSubmitting(false)
      // Close dialog first, then fetch data
      handleOpenChange(false)
      // Fetch permissions after closing dialog to avoid blocking UI
      setTimeout(async () => {
        await fetchPermissions()
      }, 150)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save permission'
      toast.error(message)
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline">Create Permission</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Permission' : 'Create New Permission'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update permission information'
              : 'Fill in the fields to create a new permission'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="read_resources"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="resource">Resource</Label>
              <Select
                value={form.resource}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, resource: value }))
                }
              >
                <SelectTrigger id="resource">
                  <SelectValue placeholder="Select a resource" />
                </SelectTrigger>
                <SelectContent className="z-[110]">
                  {getResources().map((resource) => (
                    <SelectItem key={resource} value={resource}>
                      {resource}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.resource && (
                <p className="text-xs text-red-500">{errors.resource}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="action">Action</Label>
              <Select
                value={form.action}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, action: value }))
                }
              >
                <SelectTrigger id="action">
                  <SelectValue placeholder="Select an action" />
                </SelectTrigger>
                <SelectContent className="z-[110]">
                  <SelectItem value="read">read</SelectItem>
                  <SelectItem value="create">create</SelectItem>
                  <SelectItem value="update">update</SelectItem>
                  <SelectItem value="delete">delete</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                  <SelectItem value="full">full</SelectItem>
                </SelectContent>
              </Select>
              {errors.action && (
                <p className="text-xs text-red-500">{errors.action}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Allows viewing of resource data"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>
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
