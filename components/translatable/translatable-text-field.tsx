"use client"

import * as React from "react"
import { IconAlertTriangle, IconLanguage } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type TranslatableTextFieldVariant = "tabs" | "primaryWithModal"

export interface TranslatableTextFieldProps {
  id: string
  label: React.ReactNode
  locales: readonly string[]
  defaultLocale: string
  value: Record<string, string>
  onChange: (next: Record<string, string>) => void
  variant?: TranslatableTextFieldVariant
  multiline?: boolean
  disabled?: boolean
  required?: boolean
  error?: string
  placeholder?: string
  className?: string
}

function setLocaleValue(
  prev: Record<string, string>,
  locale: string,
  text: string
): Record<string, string> {
  return { ...prev, [locale]: text }
}

function getTextareaRows(text: string): number {
  const lines = text.split("\n").length + 1
  return Math.min(12, Math.max(3, lines))
}

function localeMapsEqual(
  a: Record<string, string>,
  b: Record<string, string>,
  localeKeys: readonly string[]
): boolean {
  for (const loc of localeKeys) {
    if ((a[loc] ?? "") !== (b[loc] ?? "")) return false
  }
  return true
}

function LocaleInputs({
  locales,
  value,
  onChange,
  disabled,
  multiline,
  idPrefix,
  placeholder,
}: {
  locales: readonly string[]
  value: Record<string, string>
  onChange: (next: Record<string, string>) => void
  disabled?: boolean
  multiline?: boolean
  idPrefix: string
  placeholder?: string
}) {
  if (locales.length <= 1) {
    const loc = locales[0] ?? "en"
    const fieldId = `${idPrefix}-${loc}`
    const common = {
      id: fieldId,
      disabled,
      placeholder,
    }
    if (multiline) {
      const text = value[loc] ?? ""
      return (
        <Textarea
          {...common}
          rows={getTextareaRows(text)}
          value={text}
          onChange={(e) => onChange(setLocaleValue(value, loc, e.target.value))}
        />
      )
    }
    return (
      <Input
        {...common}
        value={value[loc] ?? ""}
        onChange={(e) => onChange(setLocaleValue(value, loc, e.target.value))}
      />
    )
  }

  const defaultTab = locales[0] ?? "en"

  return (
    <Tabs defaultValue={defaultTab} className="w-full gap-3">
      <TabsList className="h-8 w-full max-w-full flex-wrap justify-start gap-1">
        {locales.map((loc) => (
          <TabsTrigger key={loc} value={loc} className="px-2 text-xs">
            {loc.toUpperCase()}
          </TabsTrigger>
        ))}
      </TabsList>
      {locales.map((loc) => {
        const fieldId = `${idPrefix}-${loc}`
        return (
          <TabsContent key={loc} value={loc} className="mt-0">
            {multiline ? (
              (() => {
                const text = value[loc] ?? ""
                return (
              <Textarea
                id={fieldId}
                disabled={disabled}
                placeholder={placeholder}
                rows={getTextareaRows(text)}
                value={text}
                onChange={(e) =>
                  onChange(setLocaleValue(value, loc, e.target.value))
                }
              />
                )
              })()
            ) : (
              <Input
                id={fieldId}
                disabled={disabled}
                placeholder={placeholder}
                value={value[loc] ?? ""}
                onChange={(e) =>
                  onChange(setLocaleValue(value, loc, e.target.value))
                }
              />
            )}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

export function TranslatableTextField({
  id,
  label,
  locales,
  defaultLocale,
  value,
  onChange,
  variant = "tabs",
  multiline = false,
  disabled,
  required,
  error,
  placeholder,
  className,
}: TranslatableTextFieldProps) {
  const [modalOpen, setModalOpen] = React.useState(false)
  const [modalDraft, setModalDraft] = React.useState<Record<string, string>>({})
  const [showCloseTranslationsConfirm, setShowCloseTranslationsConfirm] =
    React.useState(false)
  /** Snapshot of other-locale values when the translations modal was opened. */
  const modalOpenBaselineRef = React.useRef<Record<string, string>>({})
  const otherLocales = React.useMemo(
    () => locales.filter((l) => l !== defaultLocale),
    [locales, defaultLocale]
  )

  const openTranslationsModal = React.useCallback(() => {
    const next: Record<string, string> = {}
    for (const l of otherLocales) {
      next[l] = value[l] ?? ""
    }
    modalOpenBaselineRef.current = { ...next }
    setModalDraft(next)
    setModalOpen(true)
  }, [otherLocales, value])

  const isModalDraftDirty = React.useMemo(
    () =>
      !localeMapsEqual(modalDraft, modalOpenBaselineRef.current, otherLocales),
    [modalDraft, otherLocales]
  )

  const requestCloseTranslationsModal = React.useCallback(() => {
    if (isModalDraftDirty) {
      setShowCloseTranslationsConfirm(true)
      return
    }
    setModalOpen(false)
  }, [isModalDraftDirty])

  const handleTranslationsDialogOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setModalOpen(true)
        return
      }
      if (isModalDraftDirty) {
        setShowCloseTranslationsConfirm(true)
        return
      }
      setModalOpen(false)
    },
    [isModalDraftDirty]
  )

  const confirmDiscardTranslationsModal = React.useCallback(() => {
    setShowCloseTranslationsConfirm(false)
    setModalOpen(false)
  }, [])

  React.useEffect(() => {
    if (!modalOpen) {
      setShowCloseTranslationsConfirm(false)
    }
  }, [modalOpen])

  const commitModalDraft = React.useCallback(() => {
    const merged = { ...value }
    for (const l of otherLocales) {
      merged[l] = modalDraft[l] ?? ""
    }
    onChange(merged)
    setModalOpen(false)
  }, [modalDraft, onChange, otherLocales, value])
  const primaryId = `${id}-${defaultLocale}`
  const labelHtmlFor =
    variant === "primaryWithModal"
      ? primaryId
      : locales[0]
        ? `${id}-${locales[0]}`
        : id

  const primaryControl = multiline ? (
    (() => {
      const text = value[defaultLocale] ?? ""
      return (
    <Textarea
      id={primaryId}
      disabled={disabled}
      placeholder={placeholder}
      rows={getTextareaRows(text)}
      value={text}
      onChange={(e) =>
        onChange(setLocaleValue(value, defaultLocale, e.target.value))
      }
      aria-invalid={!!error}
      aria-required={required}
    />
      )
    })()
  ) : (
    <Input
      id={primaryId}
      disabled={disabled}
      placeholder={placeholder}
      value={value[defaultLocale] ?? ""}
      onChange={(e) =>
        onChange(setLocaleValue(value, defaultLocale, e.target.value))
      }
      aria-invalid={!!error}
      aria-required={required}
    />
  )

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={labelHtmlFor}>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </Label>

      {variant === "tabs" ? (
        <LocaleInputs
          locales={locales}
          value={value}
          onChange={onChange}
          disabled={disabled}
          multiline={multiline}
          idPrefix={id}
          placeholder={placeholder}
        />
      ) : (
        <>
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">{primaryControl}</div>
            {otherLocales.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                disabled={disabled}
                onClick={openTranslationsModal}
                aria-label="Other translations"
              >
                <IconLanguage className="size-4" />
              </Button>
            ) : null}
          </div>
          <Dialog open={modalOpen} onOpenChange={handleTranslationsDialogOpenChange}>
            <DialogContent
              className="z-[105] max-w-lg"
              overlayClassName="z-[104]"
            >
              <DialogHeader>
                <DialogTitle>Translations</DialogTitle>
                <DialogDescription>
                  Edit values for languages other than {defaultLocale.toUpperCase()}.
                </DialogDescription>
              </DialogHeader>
              <LocaleInputs
                locales={otherLocales}
                value={modalDraft}
                onChange={setModalDraft}
                disabled={disabled}
                multiline={multiline}
                idPrefix={`${id}-modal`}
                placeholder={placeholder}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  onClick={requestCloseTranslationsModal}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={disabled}
                  onClick={commitModalDraft}
                >
                  OK
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={showCloseTranslationsConfirm}
            onOpenChange={setShowCloseTranslationsConfirm}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                  <IconAlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <AlertDialogTitle className="text-center text-xl font-semibold">
                  Close without saving?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  You have unsaved changes in this translation dialog. Are you sure
                  you want to close? Your edits will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
                <AlertDialogCancel className="w-full sm:w-auto">
                  Keep editing
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDiscardTranslationsModal}
                  className="w-full bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 sm:w-auto"
                >
                  Discard changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  )
}
