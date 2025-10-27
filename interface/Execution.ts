export interface ExecutionInstance {
  id: number;
  name: string;
  description: string | null;
  apiUrl: string;
  isDefault: boolean;
  isActive: boolean;
  version: string | null;
  lastSyncAt: string;
  totalWorkflows: number;
  totalExecutions: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionWorkflow {
  id: number;
  n8nId: string;
  name: string;
  active: boolean;
  tags: string[];
  nodes: number;
  connections: number;
}

export interface Execution {
  id: number;
  instanceId: number;
  workflowInternalId: number | null;
  n8nId: string;
  workflowId: string;
  workflowName: string | null;
  mode: string;
  status: 'success' | 'error' | 'canceled' | 'running' | 'waiting';
  finished: boolean;
  retryOf: number | null;
  retrySuccessId: number | null;
  startedAt: string;
  stoppedAt: string | null;
  waitingTill: string | null;
  duration: number;
  nodesCount: number;
  executedNodes: number;
  failedNode: string | null;
  inputData: any | null;
  outputData: any | null;
  errorMessage: string | null;
  errorStack: string | null;
  errorNode: string | null;
  triggeredBy: string | null;
  triggerData: any | null;
  workflowVersion: string | null;
  workflowTags: string[] | null;
  dataSize: number;
  hasLargeData: boolean;
  isArchived: boolean;
  syncedAt: string;
  syncCount: number;
  priceUsd: string | null;
  createdAt: string;
  updatedAt: string;
  instance: ExecutionInstance;
  workflow?: ExecutionWorkflow;
}

export interface ExecutionsResponse {
  items: Execution[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
