"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconGripVertical,
  IconPlus,
  IconTrash,
  IconAlertTriangle,
} from "@tabler/icons-react";

import {
  Workflow,
  WorkflowFormConfig,
  WorkflowFormField,
  WorkflowFormFieldType,
} from "@/interface/Workflow";
import { updateWorkflowFormConfig, getWebhookTemplateData } from "@/lib/api/workflows";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type EditableField = WorkflowFormField;

interface WorkflowFormBuilderProps {
  workflow: Workflow;
}

function createEmptyField(type: WorkflowFormFieldType, index: number): EditableField {
  // Use timestamp + random number + index to ensure uniqueness
  const uniqueId = `${type}_field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${index}`;

  const base: EditableField = {
    id: uniqueId,
    fieldId: uniqueId,
    label: "New field",
    type,
    required: false,
    hidden: false,
    defaultValue: null,
    options: type === "dropdown" ? [{ label: "Option 1", value: "" }] : undefined,
    validation: {},
    multiple: false,
    accept: type === "file" ? "image/*,video/*,audio/*,application/pdf" : undefined,
    order: index,
  };

  if (type === "boolean") {
    base.defaultValue = false;
  }

  return base;
}

function SortableFieldCard({
  field,
  onChange,
  onDelete,
}: {
  field: EditableField;
  onChange: (updated: EditableField) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleBasicChange = (key: keyof EditableField, value: unknown) => {
    onChange({ ...field, [key]: value } as EditableField);
  };

  const handleValidationChange = (
    key: keyof NonNullable<EditableField["validation"]>,
    value: number | string | undefined,
  ) => {
    onChange({
      ...field,
      validation: {
        ...(field.validation || {}),
        [key]: value,
      },
    });
  };

  const handleAddOption = () => {
    if (field.type !== "dropdown") return;
    const nextOptions = [...(field.options || [])];
    const newIndex = nextOptions.length + 1;
    nextOptions.push({
      label: `Option ${newIndex}`,
      value: "",
    });
    onChange({ ...field, options: nextOptions });
  };

  const handleOptionChange = (idx: number, key: "label" | "value", value: string) => {
    if (field.type !== "dropdown" || !field.options) return;
    const nextOptions = field.options.map((opt, index) =>
      index === idx ? { ...opt, [key]: value } : opt,
    );
    onChange({ ...field, options: nextOptions });
  };

  const handleRemoveOption = (idx: number) => {
    if (field.type !== "dropdown" || !field.options) return;
    const nextOptions = field.options
      .filter((_, index) => index !== idx)
      .map((opt, index) => ({
        ...opt,
        label: `Option ${index + 1}`,
      }));
    onChange({ ...field, options: nextOptions });
  };

  const typeLabel: Record<WorkflowFormFieldType, string> = {
    text: "Text",
    textarea: "Textarea",
    url: "URL",
    email: "Email",
    enum: "Enum",
    number: "Number",
    boolean: "Boolean",
    dropdown: "Dropdown",
    file: "File Upload",
    date: "Date",
    datetime: "DateTime",
  };

  return (
    <Card ref={setNodeRef} style={style} className="mb-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted text-muted-foreground hover:bg-muted/80"
          >
            <IconGripVertical className="h-4 w-4" />
            <span className="sr-only">Drag to reorder</span>
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {field.label || "Untitled field"}
            </span>
            <span className="text-xs text-muted-foreground">
              {typeLabel[field.type]} • ID: {field.fieldId}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {field.required && (
            <Badge variant="outline" className="text-xs">
              Required
            </Badge>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={onDelete}
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${field.id}-label`}>Label</Label>
            <Input
              id={`${field.id}-label`}
              value={field.label}
              onChange={(e) => handleBasicChange("label", e.target.value)}
              placeholder="Field label"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${field.id}-fieldId`}>Field ID</Label>
            <Input
              id={`${field.id}-fieldId`}
              value={field.fieldId}
              onChange={(e) => handleBasicChange("fieldId", e.target.value)}
              placeholder="internal_id_used_in_payload"
            />
            <p className="text-xs text-muted-foreground">
              Used as key in JSON payload. Only Latin letters, numbers, and underscores are recommended.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${field.id}-description`}>Description</Label>
            <Textarea
              id={`${field.id}-description`}
              value={field.description || ""}
              onChange={(e) => handleBasicChange("description", e.target.value)}
              rows={2}
              placeholder="Short description for user"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${field.id}-placeholder`}>Placeholder</Label>
            <Input
              id={`${field.id}-placeholder`}
              value={field.placeholder || ""}
              onChange={(e) => handleBasicChange("placeholder", e.target.value)}
              placeholder="Optional placeholder text"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id={`${field.id}-required`}
              checked={field.required}
              onCheckedChange={(checked) => handleBasicChange("required", checked)}
            />
            <Label htmlFor={`${field.id}-required`}>Required</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id={`${field.id}-hidden`}
              checked={field.hidden || false}
              onCheckedChange={(checked) => handleBasicChange("hidden", checked)}
            />
            <Label htmlFor={`${field.id}-hidden`}>Hidden</Label>
          </div>

          {field.type === "file" && (
            <div className="flex items-center space-x-2">
              <Switch
                id={`${field.id}-multiple`}
                checked={field.multiple || false}
                onCheckedChange={(checked) => handleBasicChange("multiple", checked)}
              />
              <Label htmlFor={`${field.id}-multiple`}>Allow multiple</Label>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Default value</Label>
          {field.type === "textarea" ? (
            <Textarea
              value={typeof field.defaultValue === "string" ? field.defaultValue : ""}
              onChange={(e) => handleBasicChange("defaultValue", e.target.value)}
              rows={3}
              placeholder="Default text"
            />
          ) : field.type === "number" ? (
            <Input
              type="text"
              value={typeof field.defaultValue === "number" ? String(field.defaultValue) : (typeof field.defaultValue === "string" ? field.defaultValue : "")}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string or valid number
                if (value === "") {
                  handleBasicChange("defaultValue", null);
                } else {
                  // Store as string in UI, but will be converted to number on save
                  handleBasicChange("defaultValue", value);
                }
              }}
              placeholder="Default number"
            />
          ) : field.type === "boolean" ? (
            <div className="flex items-center space-x-2">
              <Switch
                id={`${field.id}-default-boolean`}
                checked={Boolean(field.defaultValue)}
                onCheckedChange={(checked) =>
                  handleBasicChange("defaultValue", checked)
                }
              />
              <Label htmlFor={`${field.id}-default-boolean`}>
                {Boolean(field.defaultValue) ? "True" : "False"}
              </Label>
            </div>
          ) : field.type === "date" || field.type === "datetime" ? (
            <Input
              type={field.type === "date" ? "date" : "datetime-local"}
              value={typeof field.defaultValue === "string" ? field.defaultValue : ""}
              onChange={(e) => handleBasicChange("defaultValue", e.target.value)}
            />
          ) : field.type === "dropdown" ? (
            <Select
              value={
                typeof field.defaultValue === "string" && field.defaultValue !== ""
                  ? field.defaultValue
                  : "__none__"
              }
              onValueChange={(value) => {
                if (value === "__none__") {
                  handleBasicChange("defaultValue", null);
                } else {
                  handleBasicChange("defaultValue", value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="No default option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {(field.options || [])
                  .filter((opt) => opt.value && opt.value.trim() !== "")
                  .map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.value}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : field.type === "url" ? (
            <Input
              type="url"
              value={typeof field.defaultValue === "string" ? field.defaultValue : ""}
              onChange={(e) => handleBasicChange("defaultValue", e.target.value)}
              placeholder="https://example.com"
            />
          ) : field.type === "email" ? (
            <Input
              type="email"
              value={typeof field.defaultValue === "string" ? field.defaultValue : ""}
              onChange={(e) => handleBasicChange("defaultValue", e.target.value)}
              placeholder="user@example.com"
            />
          ) : field.type === "enum" ? (
            <Input
              value={typeof field.defaultValue === "string" ? field.defaultValue : ""}
              onChange={(e) => handleBasicChange("defaultValue", e.target.value)}
              placeholder="Enum value"
            />
          ) : (
            <Input
              value={typeof field.defaultValue === "string" ? field.defaultValue : ""}
              onChange={(e) => handleBasicChange("defaultValue", e.target.value)}
              placeholder="Default value"
            />
          )}
        </div>

        {/* Validation section */}
        <div className="space-y-2">
          <Label>Validation</Label>
          {field.type === "number" && (
            <div className="text-xs text-muted-foreground">
              Number format will be validated automatically
            </div>
          )}

          {(field.type === "text" || field.type === "textarea" || field.type === "enum") && (
            <div className="space-y-1">
              <Label htmlFor={`${field.id}-regex`} className="text-xs">
                Regex pattern
              </Label>
              <Input
                id={`${field.id}-regex`}
                value={field.validation?.regex ?? ""}
                onChange={(e) => handleValidationChange("regex", e.target.value)}
                placeholder="e.g. ^[A-Za-z0-9_]+$"
              />
            </div>
          )}

          {(field.type === "url" || field.type === "email") && (
            <div className="text-xs text-muted-foreground">
              {field.type === "url"
                ? "URL format will be validated automatically"
                : "Email format will be validated automatically"}
            </div>
          )}

          {field.type === "file" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor={`${field.id}-maxFileSizeMb`} className="text-xs">
                  Max file size (MB)
                </Label>
                <Input
                  id={`${field.id}-maxFileSizeMb`}
                  type="number"
                  value={field.validation?.maxFileSizeMb ?? ""}
                  onChange={(e) =>
                    handleValidationChange(
                      "maxFileSizeMb",
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                  placeholder="e.g. 10"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${field.id}-accept`} className="text-xs">
                  Allowed MIME types
                </Label>
                <Input
                  id={`${field.id}-accept`}
                  value={field.accept || ""}
                  onChange={(e) => handleBasicChange("accept", e.target.value)}
                  placeholder="image/*,video/*,audio/*,application/pdf"
                />
              </div>
            </div>
          )}
        </div>

        {/* Dropdown values */}
        {field.type === "dropdown" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Values</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                <IconPlus className="mr-1 h-4 w-4" />
                Add value
              </Button>
            </div>
            {(field.options || []).length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No values yet. Add at least one.
              </p>
            ) : (
              <div className="space-y-2">
                {(field.options || []).map((opt, idx) => (
                  <div
                    key={`${field.id}-opt-${idx}`}
                    className="flex items-center gap-2"
                  >
                    <Input
                      value={opt.value}
                      onChange={(e) =>
                        handleOptionChange(idx, "value", e.target.value)
                      }
                      placeholder="Enter value"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleRemoveOption(idx)}
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WorkflowFormBuilder({ workflow }: WorkflowFormBuilderProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [fields, setFields] = useState<EditableField[]>([]);
  const [version, setVersion] = useState<number>(1);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  // Fetch webhook-template-data when Form Builder tab is opened
  useEffect(() => {
    const fetchTemplateData = async () => {
      try {
        const templateDataResult = await getWebhookTemplateData(workflow.id);
        if (templateDataResult.status === 200 || templateDataResult.status === 0) {
          const data = templateDataResult.data as {
            workflowId: number;
            webhookTemplateRaw?: {
              fields?: EditableField[];
              version?: number;
              updatedAt?: string;
            };
            inputSchema?: {
              fields?: unknown[];
              version?: number;
            };
          };

          if (data?.webhookTemplateRaw?.fields) {
            // Sort fields by order
            const sortedFields = [...data.webhookTemplateRaw.fields].sort(
              (a, b) => (a.order ?? 0) - (b.order ?? 0),
            );
            setFields(sortedFields);
            setVersion(data.webhookTemplateRaw.version || 1);
          }
        }
      } catch (error) {
        console.error("Error fetching webhook template data:", error);
      }
    };

    fetchTemplateData();
  }, [workflow.id]);

  // Removed automatic form config loading to prevent webhook-template request
  // useEffect(() => {
  //   const loadConfig = async () => {
  //     setIsLoading(true);
  //     try {
  //       const response = await getWorkflowFormConfig(workflow.id);
  //       if ((response.status === 200 || response.status === 0) && response.data) {
  //         const sorted = [...response.data.fields].sort(
  //           (a, b) => (a.order ?? 0) - (b.order ?? 0),
  //         );
  //         setFields(sorted);
  //         setVersion(response.data.version || 1);
  //       } else if (response.status !== 404) {
  //         toast.error(
  //           response.message || "Failed to load form configuration for workflow",
  //         );
  //       }
  //     } catch (error) {
  //       console.error("Error loading form config:", error);
  //       toast.error("Error loading form configuration");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   loadConfig();
  // }, [workflow.id]);

  const handleAddField = (type: WorkflowFormFieldType) => {
    setFields((prev) => {
      const index = prev.length;
      const newField = createEmptyField(type, index);
      return [...prev, newField];
    });
  };

  const handleFieldChange = (id: string, updated: EditableField) => {
    setFields((prev) => {
      // Ensure fieldId is unique
      const existingFieldIds = new Set(prev.filter((f) => f.id !== id).map((f) => f.fieldId));
      if (existingFieldIds.has(updated.fieldId)) {
        toast.error(`Field ID "${updated.fieldId}" is already used. Please use a unique ID.`);
        return prev;
      }
      return prev.map((f) => (f.id === id ? updated : f));
    });
  };

  const handleFieldDelete = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFields((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id);
      const newIndex = prev.findIndex((f) => f.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((f, index) => ({ ...f, order: index }));
    });
  };

  const sortableIds = useMemo(() => fields.map((f) => f.id), [fields]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const normalizedFields = fields.map((field, index) => {
        // For dropdown fields, set label equal to value for each option
        if (field.type === "dropdown" && field.options) {
          const normalizedOptions = field.options.map((opt) => ({
            ...opt,
            label: opt.value || opt.label, // Use value as label when saving
          }));
          return {
            ...field,
            order: index,
            options: normalizedOptions,
          };
        }
        
        // For number fields, convert string defaultValue to number
        if (field.type === "number" && field.defaultValue !== null && field.defaultValue !== undefined) {
          const numValue = typeof field.defaultValue === "string" 
            ? (field.defaultValue === "" ? null : Number(field.defaultValue))
            : field.defaultValue;
          return {
            ...field,
            order: index,
            defaultValue: numValue,
          };
        }
        
        return {
          ...field,
          order: index,
        };
      });

      const payload: WorkflowFormConfig = {
        version: (version || 0) + 1,
        fields: normalizedFields,
        updatedAt: new Date().toISOString(),
      };

      const result = await updateWorkflowFormConfig(workflow.id, payload);

      if (result.status === 200 || result.status === 0) {
        toast.success("Form configuration saved successfully");
        if (result.data && Array.isArray(result.data.fields)) {
          const sorted = [...result.data.fields].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0),
          );
          setFields(sorted);
          setVersion(result.data.version || payload.version);
        } else {
          setVersion(payload.version);
        }
      } else {
        toast.error(result.message || "Failed to save form configuration");
      }

    } catch (error) {
      console.error("Error saving form configuration:", error);
      toast.error("Error saving form configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFields([]);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Form Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure the form that users fill out before running the workflow.
            Field values will be sent to the workflow API as a JSON object with keys based on Field ID.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-xs text-muted-foreground">
              Add field:
            </Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleAddField("text")}
            >
              Text
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleAddField("textarea")}
            >
              Textarea
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleAddField("url")}
            >
              URL
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleAddField("email")}
            >
              Email
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleAddField("enum")}
            >
              Enum
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleAddField("number")}
            >
              Number
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleAddField("boolean")}
            >
              Boolean
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleAddField("dropdown")}
            >
              Dropdown
            </Button>
          </div>

          {fields.length === 0 && (
            <div className="flex items-center gap-3 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              <IconAlertTriangle className="h-4 w-4" />
              <span>
                No form has been configured for this workflow yet. Users will only see the Prompt field or nothing (depending on execution logic).
              </span>
            </div>
          )}

          <DndContext
            collisionDetection={closestCenter}
            sensors={sensors}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortableIds}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field) => (
                <SortableFieldCard
                  key={field.id}
                  field={field}
                  onChange={(updated) => handleFieldChange(field.id, updated)}
                  onDelete={() => handleFieldDelete(field.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-xs text-muted-foreground">
              Current form version: v{version}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving || fields.length === 0}
              >
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save configuration"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


