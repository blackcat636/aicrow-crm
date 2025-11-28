import { fetchWithAuth } from '../api';
import {
  WorkflowsApiResponse,
  WorkflowApiResponse,
  WorkflowUpdateRequest,
  WorkflowFormConfig
} from '@/interface/Workflow';

// Remove trailing slash from API_URL to avoid double slashes
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
).replace(/\/+$/, '');

export interface WorkflowFilters {
  page?: number;
  limit?: number;
  instanceId?: number;
  id?: number;
  active?: boolean;
  search?: string;
  availableToUsers?: boolean;
}

export async function getAllWorkflows(
  filters: WorkflowFilters = {}
): Promise<WorkflowsApiResponse> {
  const {
    page = 1,
    limit = 20,
    instanceId,
    id,
    active,
    search,
    availableToUsers
  } = filters;

  try {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (instanceId !== undefined) {
      params.set('instanceId', instanceId.toString());
    }
    if (id !== undefined) {
      params.set('id', id.toString());
    }
    if (active !== undefined) {
      params.set('active', active.toString());
    }
    if (search && search.trim()) {
      params.set('search', search.trim());
    }
    if (availableToUsers !== undefined) {
      params.set('availableToUsers', availableToUsers.toString());
    }

    const url = `${API_URL}/admin/automations/workflows?${params.toString()}`;

    const response = await fetchWithAuth(url);
    const data = (await response.json()) as WorkflowsApiResponse;

    if (!response.ok) {
      return {
        status: response.status,
        message: data.message || 'Failed to fetch workflows',
        data: {
          items: [],
          total: 0,
          page: 0,
          limit: 0,
          totalPages: 0
        }
      };
    }

    // Check if successful status (200 or 0)
    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      return {
        status: data.status || 500,
        message: data.message || 'Failed to fetch workflows',
        data: {
          items: [],
          total: 0,
          page: 0,
          limit: 0,
          totalPages: 0
        }
      };
    }
  } catch (error) {
    console.error('❌ API: Error in getAllWorkflows:', error);
    return {
      status: 0,
      message: error instanceof Error ? error.message : 'Network error',
      data: {
        items: [],
        total: 0,
        page: 0,
        limit: 0,
        totalPages: 0
      }
    };
  }
}

export async function getWorkflowById(
  id: number
): Promise<WorkflowApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/automations/workflows/${id}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch workflow with id ${id}`);
    }
    const data = (await response.json()) as WorkflowApiResponse;

    // Check if successful status (200 or 0)
    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || `Failed to fetch workflow with id ${id}`);
    }
  } catch (error) {
    console.error('❌ API: Error in getWorkflowById:', error);
    return {
      status: 0,
      message: 'Network error',
      data: {
        id: 0,
        instanceId: 0,
        instance: {
          id: 0,
          name: '',
          description: null,
          apiUrl: '',
          apiKey: '',
          isDefault: false,
          isActive: false,
          syncProjects: false,
          syncWorkflows: false,
          syncExecutions: false,
          syncInterval: 0,
          version: null,
          lastSyncAt: '',
          lastErrorAt: null,
          lastError: null,
          totalProjects: 0,
          totalWorkflows: 0,
          totalExecutions: 0,
          createdAt: '',
          updatedAt: ''
        },
        projectId: null,
        n8nId: '',
        name: '',
        active: false,
        tags: [],
        nodes: 0,
        nodesData: [],
        connections: 0,
        connectionsData: {},
        n8nCreatedAt: '',
        n8nUpdatedAt: '',
        syncedAt: '',
        createdAt: '',
        updatedAt: ''
      }
    };
  }
}

export interface WorkflowFormConfigApiResponse {
  status: number;
  data: WorkflowFormConfig | null;
  message?: string;
}

export async function getWorkflowFormConfig(
  id: number
): Promise<WorkflowFormConfigApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/automations/workflows/${id}/webhook-template`
    );

    const data = (await response.json()) as WorkflowFormConfigApiResponse;

    if (!response.ok) {
      return {
        status: response.status,
        message: data.message || 'Failed to fetch workflow form configuration',
        data: null
      };
    }

    if (data.status === 200 || data.status === 0) {
      return data;
    }

    return {
      status: data.status || 500,
      message: data.message || 'Failed to fetch workflow form configuration',
      data: null
    };
  } catch (error) {
    console.error('❌ API: Error in getWorkflowFormConfig:', error);
    return {
      status: 0,
      message: 'Network error',
      data: null
    };
  }
}

export async function updateWorkflowFormConfig(
  id: number,
  formConfig: WorkflowFormConfig
): Promise<WorkflowFormConfigApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/automations/workflows/${id}/webhook-template`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formConfig)
      }
    );

    const data = (await response.json()) as WorkflowFormConfigApiResponse;

    if (!response.ok) {
      return {
        status: response.status,
        message: data.message || 'Failed to update workflow form configuration',
        data: null
      };
    }

    if (data.status === 200 || data.status === 0) {
      return data;
    }

    return {
      status: data.status || 500,
      message: data.message || 'Failed to update workflow form configuration',
      data: null
    };
  } catch (error) {
    console.error('❌ API: Error in updateWorkflowFormConfig:', error);
    return {
      status: 0,
      message: 'Network error',
      data: null
    };
  }
}

export interface WebhookTemplateDataApiResponse {
  status: number;
  data: unknown;
  message?: string;
}

export async function getWebhookTemplateData(
  id: number
): Promise<WebhookTemplateDataApiResponse> {
  try {
    const url = `${API_URL}/admin/automations/workflows/${id}/webhook-template-data`;
    const response = await fetchWithAuth(url);
    const data = (await response.json()) as WebhookTemplateDataApiResponse;

    if (!response.ok) {
      return {
        status: response.status,
        message: data.message || 'Failed to fetch webhook template data',
        data: null
      };
    }

    if (data.status === 200 || data.status === 0) {
      return data;
    }

    return {
      status: data.status || 500,
      message: data.message || 'Failed to fetch webhook template data',
      data: null
    };
  } catch (error) {
    console.error('❌ API: Error in getWebhookTemplateData:', error);
    return {
      status: 0,
      message: 'Network error',
      data: null
    };
  }
}

export async function updateWorkflow(
  id: number,
  updateData: WorkflowUpdateRequest
): Promise<WorkflowApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/automations/workflows/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update workflow with id ${id}`);
    }

    const data = (await response.json()) as WorkflowApiResponse;

    // Check if successful status (200 or 0)
    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(
        data.message || `Failed to update workflow with id ${id}`
      );
    }
  } catch (error) {
    console.error('❌ API: Error in updateWorkflow:', error);
    return {
      status: 0,
      message: 'Network error',
      data: {
        id: 0,
        instanceId: 0,
        instance: {
          id: 0,
          name: '',
          description: null,
          apiUrl: '',
          apiKey: '',
          isDefault: false,
          isActive: false,
          syncProjects: false,
          syncWorkflows: false,
          syncExecutions: false,
          syncInterval: 0,
          version: null,
          lastSyncAt: '',
          lastErrorAt: null,
          lastError: null,
          totalProjects: 0,
          totalWorkflows: 0,
          totalExecutions: 0,
          createdAt: '',
          updatedAt: ''
        },
        projectId: null,
        n8nId: '',
        name: '',
        active: false,
        tags: [],
        nodes: 0,
        nodesData: [],
        connections: 0,
        connectionsData: {},
        n8nCreatedAt: '',
        n8nUpdatedAt: '',
        syncedAt: '',
        createdAt: '',
        updatedAt: ''
      }
    };
  }
}
