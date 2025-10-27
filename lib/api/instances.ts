import {
  Instance,
  CreateInstanceRequest,
  UpdateInstanceRequest
} from '@/interface/Instance';
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

export async function getAllInstances(): Promise<ApiResponse<Instance[]>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL.replace(/\/$/, '')}/admin/automations/instances`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch instances');
    }

    return {
      status: response.status,
      message: 'Instances fetched successfully',
      data: data.data
    };
  } catch (error) {
    console.error('Error fetching instances:', error);
    return {
      status: 500,
      message:
        error instanceof Error ? error.message : 'Failed to fetch instances',
      data: []
    };
  }
}

export async function getInstanceById(
  id: number
): Promise<ApiResponse<Instance>> {
  try {
    const url = `${API_URL.replace(
      /\/$/,
      ''
    )}/admin/automations/instances/${id}`;
    console.log('Fetching instance by ID from URL:', url);
    const response = await fetchWithAuth(url);

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    const data = await response.json();
    console.log('Raw API data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch instance');
    }

    return {
      status: response.status,
      message: 'Instance fetched successfully',
      data: data.data
    };
  } catch (error) {
    console.error('Error fetching instance by ID:', error);

    // Fallback: try to get instance from the list
    console.log('Trying fallback: get instance from list...');
    try {
      const allInstancesResponse = await getAllInstances();
      if (allInstancesResponse.status === 200) {
        const instance = allInstancesResponse.data.find(
          (inst) => inst.id === id
        );
        if (instance) {
          console.log('Found instance in fallback:', instance);
          return {
            status: 200,
            message: 'Instance fetched successfully (fallback)',
            data: instance
          };
        }
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }

    return {
      status: 500,
      message:
        error instanceof Error ? error.message : 'Failed to fetch instance',
      data: {
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
        syncInterval: 30,
        version: null,
        lastSyncAt: '',
        lastErrorAt: null,
        lastError: null,
        totalProjects: 0,
        totalWorkflows: 0,
        totalExecutions: 0,
        createdAt: '',
        updatedAt: ''
      }
    };
  }
}

export async function createInstance(
  instanceData: CreateInstanceRequest
): Promise<ApiResponse<Instance>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL.replace(/\/$/, '')}/admin/automations/instances`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(instanceData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create instance');
    }

    return {
      status: response.status,
      message: 'Instance created successfully',
      data: data.data
    };
  } catch (error) {
    console.error('Error creating instance:', error);
    return {
      status: 500,
      message:
        error instanceof Error ? error.message : 'Failed to create instance',
      data: {
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
        syncInterval: 30,
        version: null,
        lastSyncAt: '',
        lastErrorAt: null,
        lastError: null,
        totalProjects: 0,
        totalWorkflows: 0,
        totalExecutions: 0,
        createdAt: '',
        updatedAt: ''
      }
    };
  }
}

export async function updateInstance(
  id: number,
  instanceData: UpdateInstanceRequest
): Promise<ApiResponse<Instance>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL.replace(/\/$/, '')}/admin/automations/instances/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(instanceData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update instance');
    }

    return {
      status: response.status,
      message: 'Instance updated successfully',
      data: data.data
    };
  } catch (error) {
    console.error('Error updating instance:', error);
    return {
      status: 500,
      message:
        error instanceof Error ? error.message : 'Failed to update instance',
      data: {
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
        syncInterval: 30,
        version: null,
        lastSyncAt: '',
        lastErrorAt: null,
        lastError: null,
        totalProjects: 0,
        totalWorkflows: 0,
        totalExecutions: 0,
        createdAt: '',
        updatedAt: ''
      }
    };
  }
}
