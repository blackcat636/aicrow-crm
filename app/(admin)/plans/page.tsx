"use client"
export const runtime = 'edge';
import { useEffect, useState, useCallback } from 'react';
import { PlansDataTable } from "@/components/plans/plans-data-table"
import { useSubscriptionPlansStore } from "@/store/useSubscriptionPlansStore"
import { CreateEditPlanDialog } from "@/components/plans/create-edit-plan-dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { SubscriptionPlan } from "@/interface/SubscriptionPlan"
import { Button } from "@/components/ui/button"
import { deletePlan } from "@/lib/api/subscription-plans"
import { toast } from "sonner"

export default function Page() { 
  const { plans, isLoading, error, total, page, limit, fetchPlans } = useSubscriptionPlansStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [duplicatingPlan, setDuplicatingPlan] = useState<SubscriptionPlan | null>(null)
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Initial load
  useEffect(() => {
    fetchPlans({ page, limit });
  }, [fetchPlans, page, limit]);

  const handlePageChange = (newPage: number) => {
    fetchPlans({ page: newPage, limit });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    fetchPlans({ page: 1, limit: newPageSize });
  };

  const handleCreateNew = () => {
    setEditingPlan(null)
    setDuplicatingPlan(null)
    setDialogOpen(true)
  }

  const handleEdit = useCallback((plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    setDuplicatingPlan(null)
    setDialogOpen(true)
  }, [])

  const [originalPlanIdForDuplication, setOriginalPlanIdForDuplication] = useState<number | null>(null)

  const handleDuplicate = useCallback((plan: SubscriptionPlan) => {
    // Create a duplicate plan object with "Copy of" prefix
    const duplicatedPlan: SubscriptionPlan = {
      ...plan,
      id: 0, // Will be set by backend on creation
      name: `Copy of ${plan.name}`,
      isDefault: false, // Don't duplicate default flag
    }

    // Store original plan ID for loading features
    setOriginalPlanIdForDuplication(plan.id)
    setDuplicatingPlan(duplicatedPlan)
    setEditingPlan(null)
    setDialogOpen(true)
  }, [])

  const handleDialogSuccess = () => {
    fetchPlans({ page, limit })
  }

  const handleDelete = useCallback((plan: SubscriptionPlan) => {
    setPlanToDelete(plan)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!planToDelete) return
    try {
      setIsDeleting(true)
      await deletePlan(planToDelete.id)
      toast.success("Plan deleted successfully")
      setPlanToDelete(null)
      await fetchPlans({ page, limit })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete plan")
    } finally {
      setIsDeleting(false)
    }
  }, [planToDelete, page, limit, fetchPlans])

  const handleDeleteDialogClose = useCallback((open: boolean) => {
    if (!open) setPlanToDelete(null)
  }, [])

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingPlan(null)
      setDuplicatingPlan(null)
      setOriginalPlanIdForDuplication(null)
    }
  }

  // Determine which plan to pass to dialog
  const planForDialog = duplicatingPlan || editingPlan

  if (isLoading && plans.length === 0) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 px-6 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Subscription Plans</h1>
            <p className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(total / limit)} • Total: {total} plans
            </p>
          </div>
          <div>
            <Button onClick={handleCreateNew}>
              Create New Plan
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <PlansDataTable 
            data={plans} 
            total={total}
            page={page}
            limit={limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <CreateEditPlanDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        plan={planForDialog}
        originalPlanIdForDuplication={originalPlanIdForDuplication}
        onSuccess={handleDialogSuccess}
      />

      <DeleteConfirmationDialog
        open={!!planToDelete}
        onOpenChange={handleDeleteDialogClose}
        onConfirm={handleDeleteConfirm}
        title="Delete subscription plan"
        description="This action cannot be undone. This will permanently delete the plan."
        itemName={planToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  )
}
