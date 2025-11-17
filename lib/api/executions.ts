import { Execution, ExecutionsResponse } from '@/interface/Execution';
import { fetchWithAuth } from '../api';

// Remove trailing slash from API_URL to avoid double slashes
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/+$/, '');

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export async function getAllExecutions(
  page: number = 1,
  limit: number = 50,
  filters?: {
    id?: number;
    instanceId?: number;
    workflowId?: string;
    search?: string;
    workflowName?: string;
    n8nId?: string;
    status?: string;
    mode?: string;
    finished?: boolean;
    hasErrors?: boolean;
    isArchived?: boolean;
  }
): Promise<ApiResponse<ExecutionsResponse>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (filters?.id !== undefined) params.append('id', filters.id.toString());
    if (filters?.instanceId !== undefined)
      params.append('instanceId', filters.instanceId.toString());
    if (filters?.workflowId) params.append('workflowId', filters.workflowId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.workflowName) params.append('workflowName', filters.workflowName);
    if (filters?.n8nId) params.append('n8nId', filters.n8nId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.mode) params.append('mode', filters.mode);
    if (filters?.finished !== undefined)
      params.append('finished', filters.finished.toString());
    if (filters?.hasErrors !== undefined)
      params.append('hasErrors', filters.hasErrors.toString());
    if (filters?.isArchived !== undefined)
      params.append('isArchived', filters.isArchived.toString());

    const response = await fetchWithAuth(
      `${API_URL}/admin/automations/executions?${params}`
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        status: response.status,
        message: data.message || 'Failed to fetch executions',
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0
        }
      };
    }

    return {
      status: response.status,
      message: 'Executions fetched successfully',
      data: data.data
    };
  } catch (error) {
    return {
      status: 500,
      message:
        error instanceof Error ? error.message : 'Failed to fetch executions',
      data: {
        items: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
      }
    };
  }
}

export async function getExecutionById(
  id: number
): Promise<ApiResponse<Execution>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/automations/executions/${id}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch execution');
    }

    return {
      status: response.status,
      message: 'Execution fetched successfully',
      data: data.data
    };
  } catch (error) {
    return {
      status: 500,
      message:
        error instanceof Error ? error.message : 'Failed to fetch execution',
      data: {
        id: 0,
        instanceId: 0,
        workflowInternalId: null,
        n8nId: '',
        workflowId: '',
        workflowName: null,
        mode: '',
        status: 'error',
        finished: false,
        retryOf: null,
        retrySuccessId: null,
        startedAt: '',
        stoppedAt: null,
        waitingTill: null,
        duration: 0,
        nodesCount: 0,
        executedNodes: 0,
        failedNode: null,
        inputData: null,
        outputData: null,
        errorMessage: null,
        errorStack: null,
        errorNode: null,
        triggeredBy: null,
        triggerData: null,
        workflowVersion: null,
        workflowTags: null,
        dataSize: 0,
        hasLargeData: false,
        isArchived: false,
        syncedAt: '',
        syncCount: 0,
        priceUsd: null,
        createdAt: '',
        updatedAt: '',
        instance: {
          id: 0,
          name: '',
          description: null,
          apiUrl: '',
          isDefault: false,
          isActive: false,
          version: null,
          lastSyncAt: '',
          totalWorkflows: 0,
          totalExecutions: 0,
          createdAt: '',
          updatedAt: ''
        }
      }
    };
  }
}
