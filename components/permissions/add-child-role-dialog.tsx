"use client"

import { useState, useEffect, useMemo } from 'react'
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
import { addChildRole, getChildRoles } from '@/lib/api/roles'
import { useRolesStore } from '@/store/useRolesStore'
import { Role } from '@/interface/Role'

interface AddChildRoleDialogProps {
  parentRole: Role | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddChildRoleDialog({
  parentRole,
  open,
  onOpenChange,
}: AddChildRoleDialogProps) {
  const { roles, fetchRoles } = useRolesStore()
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingChildRoleIds, setExistingChildRoleIds] = useState<Set<number>>(new Set())
  const [isLoadingChildren, setIsLoadingChildren] = useState(false)

  // Ensure roles are loaded when dialog opens
  useEffect(() => {
    if (open && roles.length === 0) {
      fetchRoles()
    }
  }, [open, roles.length, fetchRoles])

  // Fetch existing child roles when dialog opens
  useEffect(() => {
    if (open && parentRole?.id) {
      setIsLoadingChildren(true)
      
      getChildRoles(parentRole.id)
        .then((response) => {
          if (response.data && Array.isArray(response.data)) {
            const childIds = new Set(response.data.map((child: Role) => {
              return child.id
            }))
            setExistingChildRoleIds(childIds)
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`⚠️ Response.data is not an array:`, response.data)
            }
          }
        })
        .catch((error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Error fetching child roles:', error)
          }
          // Fallback to using parentRole.children if API fails
          if (parentRole?.children) {
            const childIds = new Set(parentRole.children.map((child) => child.id))
            setExistingChildRoleIds(childIds)
          }
        })
        .finally(() => {
          setIsLoadingChildren(false)
        })
    } else if (!open) {
      setSelectedChildId('')
      setExistingChildRoleIds(new Set())
    }
  }, [open, parentRole?.id, parentRole?.children])

  // Filter out the parent role and roles that are already children
  const availableRoles = useMemo(() => {
    if (!parentRole?.id || roles.length === 0) {
      return []
    }
    
    const filtered = roles.filter(
      (role) =>
        role.id !== parentRole.id &&
        !existingChildRoleIds.has(role.id)
    )
    
    return filtered
  }, [roles, parentRole?.id, existingChildRoleIds])


  const handleSubmit = async () => {
    if (!selectedChildId || !parentRole) return

    try {
      setIsSubmitting(true)
      await addChildRole(parentRole.id, parseInt(selectedChildId))
      toast.success('Child role added successfully')
      setIsSubmitting(false)
      
      // Update existing child roles list immediately
      setExistingChildRoleIds((prev) => new Set([...prev, parseInt(selectedChildId)]))
      
      onOpenChange(false)
      // Fetch roles after closing dialog to avoid blocking UI
      setTimeout(async () => {
        await fetchRoles()
      }, 150)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add child role'
      toast.error(message)
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Child Role</DialogTitle>
          <DialogDescription>
            Select a role to add as a child role for &quot;{parentRole?.name}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="childRole">Child Role</Label>
            <Select 
              value={selectedChildId} 
              onValueChange={setSelectedChildId}
            >
              <SelectTrigger id="childRole" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent 
                className="z-[110]"
                onPointerDownOutside={(e) => {
                  // Prevent closing Select when clicking outside, but allow Dialog to handle it
                  const target = e.target as HTMLElement
                  // Only prevent if clicking on Dialog overlay, not on other elements
                  if (target.closest('[data-radix-dialog-overlay]')) {
                    e.preventDefault()
                  }
                }}
              >
                {isLoadingChildren ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : availableRoles.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No available roles
                  </div>
                ) : (
                  availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name} - {role.description}
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
