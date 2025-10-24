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
