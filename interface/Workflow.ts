export interface WorkflowInstance {
  id: number;
  name: string;
  description: string | null;
  apiUrl: string;
  apiKey: string;
  isDefault: boolean;
  isActive: boolean;
  syncProjects: boolean;
  syncWorkflows: boolean;
  syncExecutions: boolean;
  syncInterval: number;
  version: string | null;
  lastSyncAt: string;
  lastErrorAt: string | null;
  lastError: string | null;
  totalProjects: number;
  totalWorkflows: number;
  totalExecutions: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters: Record<string, any>;
  typeVersion: number;
  webhookId?: string;
  credentials?: Record<string, { id: string; name: string }>;
}

export interface WorkflowConnection {
  node: string;
  type: string;
  index: number;
}

export interface WorkflowConnections {
  [nodeName: string]: {
    main: WorkflowConnection[][];
  };
}

export type WorkflowFormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'dropdown'
  | 'file'
  | 'date'
  | 'datetime';

export interface WorkflowFormFieldOption {
  label: string;
  value: string;
}

export interface WorkflowFormFieldValidation {
  min?: number;
  max?: number;
  regex?: string;
  maxFileSizeMb?: number;
}

export interface WorkflowFormField {
  /** Internal unique identifier for drag-and-drop and editing */
  id: string;
  /** Field ID used as key in input payload */
  fieldId: string;
  label: string;
  type: WorkflowFormFieldType;
  description?: string;
  hint?: string;
  required: boolean;
  /** Default value in a type-appropriate format */
  defaultValue?: string | number | boolean | null;
  /** Dropdown options (only for dropdown type) */
  options?: WorkflowFormFieldOption[];
  /** Validation rules depending on field type */
  validation?: WorkflowFormFieldValidation;
  /** Allow multiple selection / multiple files where applicable */
  multiple?: boolean;
  /** File MIME filter (e.g. image/*,application/pdf) for file uploads */
  accept?: string;
  /** Explicit order index for stable rendering */
  order: number;
}

export interface WorkflowFormConfig {
  version: number;
  fields: WorkflowFormField[];
  updatedAt?: string;
}

export interface Workflow {
  id: number;
  instanceId: number;
  instance: WorkflowInstance;
  projectId: number | null;
  n8nId: string;
  name: string;
  displayName?: string;
  displayDescription?: string;
  availableToUsers?: boolean;
  priceUsd?: number;
  active: boolean;
  tags: string[];
  nodes: number;
  nodesData?: WorkflowNode[];
  connections: number;
  connectionsData?: WorkflowConnections;
  /** Optional dynamic form configuration for workflow execution */
  formConfig?: WorkflowFormConfig | null;
  n8nCreatedAt: string;
  n8nUpdatedAt: string;
  syncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowsApiResponse {
  status: number;
  data: {
    items: Workflow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export interface WorkflowUpdateRequest {
  displayName?: string;
  displayDescription?: string;
  availableToUsers?: boolean;
  priceUsd?: number;
}

export interface WorkflowApiResponse {
  status: number;
  data: Workflow;
  message?: string;
}
