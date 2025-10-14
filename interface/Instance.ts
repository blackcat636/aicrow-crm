export interface Instance {
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

export interface InstancesResponse {
  status: number;
  data: Instance[];
}

export interface InstanceResponse {
  status: number;
  data: Instance;
}

export interface CreateInstanceRequest {
  name: string;
  apiUrl: string;
  apiKey: string;
}

export interface UpdateInstanceRequest {
  name: string;
  apiUrl: string;
  apiKey: string;
}
