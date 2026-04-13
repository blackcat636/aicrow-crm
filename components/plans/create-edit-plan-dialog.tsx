"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  SubscriptionPlan,
  UpdatePlanRequest,
  type CreatePlanRequest,
} from "@/interface/SubscriptionPlan"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconAlertTriangle } from "@tabler/icons-react"
import { TranslatableTextField } from "@/components/translatable"
import { ADMIN_DEFAULT_LOCALE, ADMIN_LOCALES } from "@/lib/config/admin-locales"
import {
  buildNullableDescriptionDeltaForPut,
  buildTranslatableFieldDeltaForPut,
  emptyTranslatableMap,
  isDefaultLocaleFilled,
  normalizeFromApi,
  serializeForApi,
  serializeNullableForApi,
} from "@/lib/translatable"

type Period = "monthly" | "yearly" | "one_time"

interface FormData {
  nameByLocale: Record<string, string>
  descriptionByLocale: Record<string, string>
  price: number
  period: Period
  trialDays: number
  tokensIncluded: number
  isActive: boolean
  isDefault: boolean
}

type FormErrors = Partial<{
  name: string
  description: string
  price: string
  period: string
  tokensIncluded: string
  trialDays: string
}>

function cloneFormData(f: FormData): FormData {
  return {
    nameByLocale: { ...f.nameByLocale },
    descriptionByLocale: { ...f.descriptionByLocale },
    price: f.price,
    period: f.period,
    trialDays: f.trialDays,
    tokensIncluded: f.tokensIncluded,
    isActive: f.isActive,
    isDefault: f.isDefault,
  }
}

function formsEqual(a: FormData, b: FormData): boolean {
  for (const loc of ADMIN_LOCALES) {
    if ((a.nameByLocale[loc] ?? "") !== (b.nameByLocale[loc] ?? "")) {
      return false
    }
    if ((a.descriptionByLocale[loc] ?? "") !== (b.descriptionByLocale[loc] ?? "")) {
      return false
    }
  }
  return (
    a.price === b.price &&
    a.period === b.period &&
    a.trialDays === b.trialDays &&
    a.tokensIncluded === b.tokensIncluded &&
    a.isActive === b.isActive &&
    a.isDefault === b.isDefault
  )
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
    nameByLocale: emptyTranslatableMap(ADMIN_LOCALES),
    descriptionByLocale: emptyTranslatableMap(ADMIN_LOCALES),
    price: 0,
    period: "monthly",
    trialDays: 0,
    tokensIncluded: 0,
    isActive: true,
    isDefault: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})

  /** Snapshot of translatable fields when the form was last loaded (for edit PUT deltas). */
  const initialNameByLocaleRef = useRef<Record<string, string>>(
    emptyTranslatableMap(ADMIN_LOCALES)
  )
  const initialDescriptionByLocaleRef = useRef<Record<string, string>>(
    emptyTranslatableMap(ADMIN_LOCALES)
  )

  /** Last loaded snapshot for dirty detection (discard confirmation). */
  const baselineFormRef = useRef<FormData | null>(null)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  useEffect(() => {
    if (!open) {
      setShowDiscardConfirm(false)
    }
  }, [open])

  // Load full plan data when editing or duplicating (list may not include tokensIncluded; also check features for token_limit)
  useEffect(() => {
    if (open && !plan) {
      initialNameByLocaleRef.current = emptyTranslatableMap(ADMIN_LOCALES)
      initialDescriptionByLocaleRef.current = emptyTranslatableMap(ADMIN_LOCALES)
      const next: FormData = {
        nameByLocale: emptyTranslatableMap(ADMIN_LOCALES),
        descriptionByLocale: emptyTranslatableMap(ADMIN_LOCALES),
        price: 0,
        period: "monthly",
        trialDays: 0,
        tokensIncluded: 0,
        isActive: true,
        isDefault: false,
      }
      baselineFormRef.current = cloneFormData(next)
      setForm(next)
      setShowDefaultWarning(false)
      return
    }
    if (!open || !plan) return

    const planIdToLoad = plan.id > 0 ? plan.id : (originalPlanIdForDuplication ?? null)
    if (!planIdToLoad) {
      const nameByLocale = normalizeFromApi(
        plan.name,
        ADMIN_DEFAULT_LOCALE,
        ADMIN_LOCALES
      )
      const descriptionByLocale = normalizeFromApi(
        plan.description ?? null,
        ADMIN_DEFAULT_LOCALE,
        ADMIN_LOCALES
      )
      initialNameByLocaleRef.current = { ...nameByLocale }
      initialDescriptionByLocaleRef.current = { ...descriptionByLocale }
      const next: FormData = {
        nameByLocale,
        descriptionByLocale,
        price: Number(plan.price) || 0,
        period: (plan.period ?? "monthly") as Period,
        trialDays: Number(plan.trialDays) || 0,
        tokensIncluded: Number(plan.tokensIncluded) || 0,
        isActive: plan.isActive ?? true,
        isDefault: plan.isDefault ?? false,
      }
      baselineFormRef.current = cloneFormData(next)
      setForm(next)
      return
    }

    // Fetch full plan by ID so we get tokensIncluded if backend returns it
    getPlanById(planIdToLoad)
      .then((res) => {
        if (res.status !== 200 && res.status !== 0) return
        const p = res.data
        const tokensIncluded = Number(p.tokensIncluded) || 0
        const nameByLocale = normalizeFromApi(
          p.name,
          ADMIN_DEFAULT_LOCALE,
          ADMIN_LOCALES
        )
        const descriptionByLocale = normalizeFromApi(
          p.description ?? null,
          ADMIN_DEFAULT_LOCALE,
          ADMIN_LOCALES
        )
        initialNameByLocaleRef.current = { ...nameByLocale }
        initialDescriptionByLocaleRef.current = { ...descriptionByLocale }
        const next: FormData = {
          nameByLocale,
          descriptionByLocale,
          price: Number(p.price) || 0,
          period: (p.period ?? "monthly") as Period,
          trialDays: Number(p.trialDays) || 0,
          tokensIncluded,
          isActive: p.isActive ?? true,
          isDefault: p.isDefault ?? false,
        }
        baselineFormRef.current = cloneFormData(next)
        setForm(next)
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
              setForm((prev) => {
                const merged: FormData = { ...prev, tokensIncluded: limit }
                baselineFormRef.current = cloneFormData(merged)
                return merged
              })
            }
          }).catch(() => {})
        }
      })
      .catch(() => {
        const nameByLocale = normalizeFromApi(
          plan.name,
          ADMIN_DEFAULT_LOCALE,
          ADMIN_LOCALES
        )
        const descriptionByLocale = normalizeFromApi(
          plan.description ?? null,
          ADMIN_DEFAULT_LOCALE,
          ADMIN_LOCALES
        )
        initialNameByLocaleRef.current = { ...nameByLocale }
        initialDescriptionByLocaleRef.current = { ...descriptionByLocale }
        const next: FormData = {
          nameByLocale,
          descriptionByLocale,
          price: Number(plan.price) || 0,
          period: (plan.period ?? "monthly") as Period,
          trialDays: Number(plan.trialDays) || 0,
          tokensIncluded: Number(plan.tokensIncluded) || 0,
          isActive: plan.isActive ?? true,
          isDefault: plan.isDefault ?? false,
        }
        baselineFormRef.current = cloneFormData(next)
        setForm(next)
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

  const isDirty = useMemo(() => {
    const b = baselineFormRef.current
    if (!b) return false
    return !formsEqual(form, b)
  }, [form])

  const handleDialogOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        onOpenChange(true)
        return
      }
      if (isSubmitting) {
        return
      }
      if (isDirty) {
        setShowDiscardConfirm(true)
        return
      }
      onOpenChange(false)
    },
    [isDirty, isSubmitting, onOpenChange]
  )

  const confirmDiscardAndClose = useCallback(() => {
    setShowDiscardConfirm(false)
    onOpenChange(false)
  }, [onOpenChange])

  // Basic client-side validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!isDefaultLocaleFilled(form.nameByLocale, ADMIN_DEFAULT_LOCALE)) {
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
      if (isEditMode && plan) {
        const updateBody: UpdatePlanRequest = {
          price: Number(form.price),
          period: form.period,
          trialDays: Number(form.trialDays),
          isActive: form.isActive,
          isDefault: form.isDefault,
        }
        const nameDelta = buildTranslatableFieldDeltaForPut(
          form.nameByLocale,
          initialNameByLocaleRef.current,
          ADMIN_LOCALES
        )
        if (nameDelta !== undefined) {
          updateBody.name = nameDelta
        }
        const descDelta = buildNullableDescriptionDeltaForPut(
          form.descriptionByLocale,
          initialDescriptionByLocaleRef.current,
          ADMIN_LOCALES
        )
        if (descDelta === undefined) {
          // omit description
        } else if (descDelta === null) {
          updateBody.description = null
        } else {
          updateBody.description = descDelta
        }

        const response = await updatePlan(plan.id, updateBody)
        if (response.status !== 200) {
          throw new Error(response.message || "Failed to update plan")
        }
      } else {
        const createBody: CreatePlanRequest = {
          name: serializeForApi(form.nameByLocale, ADMIN_DEFAULT_LOCALE),
          description: serializeNullableForApi(
            form.descriptionByLocale,
            ADMIN_DEFAULT_LOCALE
          ),
          price: Number(form.price),
          period: form.period,
          trialDays: Number(form.trialDays),
          isActive: form.isActive,
          isDefault: form.isDefault,
        }
        const response = await createPlan(createBody)
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
    <>
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
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
            
            <TranslatableTextField
              id="plan-name"
              label="Name"
              locales={ADMIN_LOCALES}
              defaultLocale={ADMIN_DEFAULT_LOCALE}
              value={form.nameByLocale}
              onChange={(nameByLocale) =>
                setForm((f) => ({ ...f, nameByLocale }))
              }
              variant="primaryWithModal"
              required
              error={errors.name}
              placeholder="Plan name"
            />

            <TranslatableTextField
              id="plan-description"
              label="Description"
              locales={ADMIN_LOCALES}
              defaultLocale={ADMIN_DEFAULT_LOCALE}
              value={form.descriptionByLocale}
              onChange={(descriptionByLocale) =>
                setForm((f) => ({ ...f, descriptionByLocale }))
              }
              variant="primaryWithModal"
              multiline
              placeholder="Plan description and benefits"
            />

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

        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleDialogOpenChange(false)}
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

    <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <IconAlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <AlertDialogTitle className="text-center text-xl font-semibold">
            Close without saving?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            You have unsaved changes. Are you sure you want to close? Your edits
            will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
          <AlertDialogCancel className="w-full sm:w-auto">Keep editing</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDiscardAndClose}
            className="w-full bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 sm:w-auto"
          >
            Discard changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
