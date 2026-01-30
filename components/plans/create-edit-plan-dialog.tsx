"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { createPlan, updatePlan, getPlanById, getPlanFeatures } from "@/lib/api/subscription-plans"
import { useSubscriptionPlansStore } from "@/store/useSubscriptionPlansStore"
import { SubscriptionPlan } from "@/interface/SubscriptionPlan"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconAlertTriangle } from "@tabler/icons-react"

type Period = "monthly" | "yearly" | "one_time"

interface FormData {
  name: string
  description: string
  price: number
  period: Period
  trialDays: number
  tokensIncluded: number
  isActive: boolean
  isDefault: boolean
}

interface CreateEditPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: SubscriptionPlan | null
  originalPlanIdForDuplication?: number | null // Original plan ID when duplicating
  onSuccess?: () => void
}

export function CreateEditPlanDialog({
  open,
  onOpenChange,
  plan,
  originalPlanIdForDuplication,
  onSuccess,
}: CreateEditPlanDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { fetchPlans, page, limit, plans } = useSubscriptionPlansStore()
  const [showDefaultWarning, setShowDefaultWarning] = useState(false)

  // Determine if we're editing (plan has valid ID) or creating/duplicating
  const isEditMode = !!plan && plan.id > 0
  const isDuplicating = !!plan && plan.id === 0 && !!originalPlanIdForDuplication

  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    price: 0,
    period: "monthly",
    trialDays: 0,
    tokensIncluded: 0,
    isActive: true,
    isDefault: false,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  )

  // Load full plan data when editing or duplicating (list may not include tokensIncluded; also check features for token_limit)
  useEffect(() => {
    if (open && !plan) {
      setForm({
        name: "",
        description: "",
        price: 0,
        period: "monthly",
        trialDays: 0,
        tokensIncluded: 0,
        isActive: true,
        isDefault: false,
      })
      setShowDefaultWarning(false)
      return
    }
    if (!open || !plan) return

    const planIdToLoad = plan.id > 0 ? plan.id : (originalPlanIdForDuplication ?? null)
    if (!planIdToLoad) {
      setForm({
        name: plan.name ?? "",
        description: plan.description ?? "",
        price: Number(plan.price) || 0,
        period: (plan.period ?? "monthly") as Period,
        trialDays: Number(plan.trialDays) || 0,
        tokensIncluded: Number(plan.tokensIncluded) || 0,
        isActive: plan.isActive ?? true,
        isDefault: plan.isDefault ?? false,
      })
      return
    }

    // Fetch full plan by ID so we get tokensIncluded if backend returns it
    getPlanById(planIdToLoad)
      .then((res) => {
        if (res.status !== 200 && res.status !== 0) return
        const p = res.data
        const tokensIncluded = Number(p.tokensIncluded) || 0
        setForm({
          name: p.name ?? "",
          description: p.description ?? "",
          price: Number(p.price) || 0,
          period: (p.period ?? "monthly") as Period,
          trialDays: Number(p.trialDays) || 0,
          tokensIncluded,
          isActive: p.isActive ?? true,
          isDefault: p.isDefault ?? false,
        })
        // If plan didn't have tokensIncluded, try to get it from features (monthly_tokens / token_limit)
        if (tokensIncluded === 0) {
          getPlanFeatures(planIdToLoad).then((featuresRes) => {
            if (featuresRes.status !== 200 || !featuresRes.data?.length) return
            const tokenFeature = featuresRes.data.find(
              (f: { featureKey?: string; featureType?: string; featureValue?: { limit?: number } }) =>
                f.featureKey === "monthly_tokens" || f.featureType === "token_limit"
            )
            const limit = tokenFeature?.featureValue?.limit
            if (typeof limit === "number" && limit >= 0) {
              setForm((prev) => ({ ...prev, tokensIncluded: limit }))
            }
          }).catch(() => {})
        }
      })
      .catch(() => {
        setForm({
          name: plan.name ?? "",
          description: plan.description ?? "",
          price: Number(plan.price) || 0,
          period: (plan.period ?? "monthly") as Period,
          trialDays: Number(plan.trialDays) || 0,
          tokensIncluded: Number(plan.tokensIncluded) || 0,
          isActive: plan.isActive ?? true,
          isDefault: plan.isDefault ?? false,
        })
      })
  }, [open, plan, originalPlanIdForDuplication])

  // Check for existing default plan when isDefault is checked
  useEffect(() => {
    if (form.isDefault && !isEditMode) {
      const hasDefault = plans.some((p) => p.isDefault && p.id !== plan?.id)
      setShowDefaultWarning(hasDefault)
    } else {
      setShowDefaultWarning(false)
    }
  }, [form.isDefault, plans, isEditMode, plan])

  // Basic client-side validation
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!form.name || form.name.trim().length === 0) {
      newErrors.name = "Name is required"
    }
    if (form.price === undefined || form.price < 0) {
      newErrors.price = "Price must be 0 or greater"
    }
    if (!form.period) {
      newErrors.period = "Period is required"
    }
    if (form.tokensIncluded === undefined || form.tokensIncluded < 0) {
      newErrors.tokensIncluded = "Tokens included must be 0 or greater"
    }
    if (form.trialDays < 0) {
      newErrors.trialDays = "Trial days must be 0 or greater"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      setIsSubmitting(true)

      // Step 1: Create or update the plan
      const planData = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        period: form.period,
        trialDays: Number(form.trialDays),
        tokensIncluded: Number(form.tokensIncluded),
        isActive: form.isActive,
        isDefault: form.isDefault,
      }

      if (isEditMode && plan) {
        const response = await updatePlan(plan.id, planData)
        if (response.status !== 200) {
          throw new Error(response.message || "Failed to update plan")
        }
      } else {
        const response = await createPlan(planData)
        if (response.status !== 200 && response.status !== 201) {
          throw new Error(response.message || "Failed to create plan")
        }
      }

      // Step 2: Save features via POST when backend supports it.
      // Backend currently returns 405 for POST .../features with featureType "access",
      // so we do not call the API for automations/content_factory to avoid failed requests.
      // When backend adds support, uncomment and use addPlanFeature(planId, { featureType, featureKey, featureValue }).

      toast.success(
        isEditMode ? "Plan updated successfully" : "Plan created successfully"
      )
      onOpenChange(false)
      await fetchPlans({ page, limit })
      onSuccess?.()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save plan"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode 
              ? "Edit Subscription Plan" 
              : isDuplicating 
              ? "Duplicate Subscription Plan"
              : "Create New Subscription Plan"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the subscription plan details below."
              : isDuplicating
              ? "Review and modify the duplicated plan details below."
              : "Fill out the fields below to create a new subscription plan."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Info</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Plan name"
                value={form.name ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
              {errors.name ? (
                <p className="text-xs text-red-500">{errors.name}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Plan description and benefits"
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="space-y-0.5">
                  <Label>Is Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Show this plan on the website
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, isActive: !!checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="space-y-0.5">
                  <Label>Is Default</Label>
                  <p className="text-xs text-muted-foreground">
                    Assign automatically to new users
                  </p>
                </div>
                <Switch
                  checked={form.isDefault}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, isDefault: !!checked }))
                  }
                />
              </div>
            </div>

            {showDefaultWarning && (
              <Alert>
                <IconAlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Setting this plan as default will remove the default flag from
                  another plan.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Pricing Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pricing</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="price">
                Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.price ?? 0}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))
                }
              />
              {errors.price ? (
                <p className="text-xs text-red-500">{errors.price}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="period">
                Period <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.period ?? "monthly"}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, period: value as Period }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Month</SelectItem>
                  <SelectItem value="yearly">Year</SelectItem>
                  <SelectItem value="one_time">Lifetime</SelectItem>
                </SelectContent>
              </Select>
              {errors.period ? (
                <p className="text-xs text-red-500">{errors.period}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="trialDays">Trial Days</Label>
              <Input
                id="trialDays"
                type="number"
                min="0"
                placeholder="0"
                value={form.trialDays ?? 0}
                onChange={(e) =>
                  setForm((f) => ({ ...f, trialDays: parseInt(e.target.value) || 0 }))
                }
              />
              {errors.trialDays ? (
                <p className="text-xs text-red-500">{errors.trialDays}</p>
              ) : null}
            </div>
          </div>

          <Separator />

          {/* Limits & Features Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Limits & Features</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="tokensIncluded">
                Tokens Included <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tokensIncluded"
                type="number"
                min="0"
                placeholder="0"
                value={form.tokensIncluded ?? 0}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tokensIncluded: parseInt(e.target.value) || 0,
                  }))
                }
              />
              {errors.tokensIncluded ? (
                <p className="text-xs text-red-500">{errors.tokensIncluded}</p>
              ) : null}
            </div>
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
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="mr-2">Saving...</span>
              </>
            ) : isEditMode ? (
              "Update Plan"
            ) : (
              "Create Plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
