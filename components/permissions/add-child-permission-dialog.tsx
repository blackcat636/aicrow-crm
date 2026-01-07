"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { addChildPermission, getChildPermissions } from '@/lib/api/permissions'
import { usePermissionsStore } from '@/store/usePermissionsStore'
import { Permission } from '@/interface/Permission'

interface AddChildPermissionDialogProps {
  parentPermission: Permission | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddChildPermissionDialog({
  parentPermission,
  open,
  onOpenChange,
}: AddChildPermissionDialogProps) {
  const { permissions, fetchPermissions } = usePermissionsStore()
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingChildPermissionIds, setExistingChildPermissionIds] = useState<Set<number>>(new Set())
  const [isLoadingChildren, setIsLoadingChildren] = useState(false)

  // Fetch existing child permissions when dialog opens
  useEffect(() => {
    if (open && parentPermission?.id) {
      setIsLoadingChildren(true)
      getChildPermissions(parentPermission.id)
        .then((response) => {
          if (response.data && Array.isArray(response.data)) {
            const childIds = new Set(response.data.map((child: Permission) => child.id))
            setExistingChildPermissionIds(childIds)
          }
        })
        .catch((error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching child permissions:', error)
          }
          // Fallback to using parentPermission.children if API fails
          if (parentPermission?.children) {
            const childIds = new Set(parentPermission.children.map((child) => child.id))
            setExistingChildPermissionIds(childIds)
          }
        })
        .finally(() => {
          setIsLoadingChildren(false)
        })
    } else if (!open) {
      setSelectedChildId('')
      setExistingChildPermissionIds(new Set())
    }
  }, [open, parentPermission?.id, parentPermission?.children])

  // Filter out the parent permission and permissions that are already children
  const availablePermissions = permissions.filter(
    (permission) =>
      permission.id !== parentPermission?.id &&
      !existingChildPermissionIds.has(permission.id)
  )

  const handleSubmit = async () => {
    if (!selectedChildId || !parentPermission) return

    try {
      setIsSubmitting(true)
      await addChildPermission(
        parentPermission.id,
        parseInt(selectedChildId)
      )
      toast.success('Child permission added successfully')
      setIsSubmitting(false)
      
      // Update existing child permissions list immediately
      setExistingChildPermissionIds((prev) => new Set([...prev, parseInt(selectedChildId)]))
      
      onOpenChange(false)
      // Fetch permissions after closing dialog to avoid blocking UI
      setTimeout(async () => {
        await fetchPermissions()
      }, 150)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to add child permission'
      toast.error(message)
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Child Permission</DialogTitle>
          <DialogDescription>
            Select a permission to add as a child permission for &quot;{parentPermission?.name}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="childPermission">Child Permission</Label>
            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
              <SelectTrigger id="childPermission">
                <SelectValue placeholder="Select a permission" />
              </SelectTrigger>
              <SelectContent className="z-[110]">
                {isLoadingChildren ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : availablePermissions.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No available permissions
                  </div>
                ) : (
                  availablePermissions.map((permission) => (
                    <SelectItem
                      key={permission.id}
                      value={permission.id.toString()}
                    >
                      {permission.name} - {permission.description}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedChildId}
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
