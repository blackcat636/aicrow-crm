import { fetchWithAuth } from '../api';
import {
  WorkflowsApiResponse,
  WorkflowApiResponse
} from '@/interface/Workflow';

// Remove trailing slash from API_URL to avoid double slashes
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
).replace(/\/+$/, '');

export async function getAllWorkflows(
  page: number = 1,
  limit: number = 10
): Promise<WorkflowsApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/automations/workflows?page=${page}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch workflows');
    }
    const data = (await response.json()) as WorkflowsApiResponse;

    // Check if successful status (200 or 0)
    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to fetch workflows');
    }
  } catch (error) {
    console.error('❌ API: Error in getAllWorkflows:', error);
    return {
      status: 0,
      message: 'Network error',
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
