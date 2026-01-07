import { fetchWithAuth } from '../api';
import {
  PermissionsApiResponse,
  PermissionApiResponse,
  Permission
} from '@/interface/Permission';

export async function getAllPermissions(): Promise<PermissionsApiResponse> {
  try {
    const response = await fetchWithAuth('/api/admin/permissions/permissions');
    const rawData = await response.json();

    if (!response.ok) {
      return {
        status: response.status,
        message: rawData.message || 'Failed to fetch permissions',
        data: [],
        total: 0,
        page: 0,
        limit: 0
      };
    }

    const data: PermissionsApiResponse = {
      status: rawData.status || 200,
      message: rawData.message || 'Permissions retrieved successfully',
      data: Array.isArray(rawData.data) ? rawData.data : [],
      total: rawData.total || 0,
      page: rawData.page || 1,
      limit: rawData.limit || 100
    };

    return data;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return {
      status: 0,
      message: error instanceof Error ? error.message : 'Network error',
      data: [],
      total: 0,
      page: 0,
      limit: 0
    };
  }
}

export async function getPermissionById(
  id: number
): Promise<PermissionApiResponse> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/permissions/permissions/${id}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch permission with id ${id}`);
    }
    const data = (await response.json()) as PermissionApiResponse;
    return data;
  } catch (error) {
    console.error('Error fetching permission by id:', error);
    throw error;
  }
}

export async function createPermission(permissionData: {
  name: string;
  resource: string;
  action: string;
  description: string;
}): Promise<PermissionApiResponse> {
  try {
    const response = await fetchWithAuth('/api/admin/permissions/permissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(permissionData)
    });

    const data = (await response.json()) as PermissionApiResponse;

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create permission');
    }

    return data;
  } catch (error) {
    console.error('Error creating permission:', error);
    throw error;
  }
}

export async function updatePermission(
  id: number,
  permissionData: {
    name?: string;
    resource?: string;
    action?: string;
    description?: string;
  }
): Promise<PermissionApiResponse> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/permissions/permissions/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(permissionData)
      }
    );

    const data = (await response.json()) as PermissionApiResponse;

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update permission');
    }

    return data;
  } catch (error) {
    console.error('Error updating permission:', error);
    throw error;
  }
}

export async function deletePermission(
  id: number
): Promise<{ status: number; message: string }> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/permissions/permissions/${id}`,
      {
        method: 'DELETE'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete permission');
    }

    return data;
  } catch (error) {
    console.error('Error deleting permission:', error);
    throw error;
  }
}

export async function addChildPermission(
  parentPermissionId: number,
  childPermissionId: number
): Promise<{ status: number; message: string; data?: unknown }> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/permissions/permissions/${parentPermissionId}/children`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parentPermissionId,
          childPermissionId
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add child permission');
    }

    return data;
  } catch (error) {
    console.error('Error adding child permission:', error);
    throw error;
  }
}

export async function removeChildPermission(
  parentPermissionId: number,
  childPermissionId: number
): Promise<{ status: number; message: string }> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/permissions/permissions/${parentPermissionId}/children/${childPermissionId}`,
      {
        method: 'DELETE'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove child permission');
    }

    return data;
  } catch (error) {
    console.error('Error removing child permission:', error);
    throw error;
  }
}

export async function getChildPermissions(
  permissionId: number
): Promise<{ status: number; message: string; data: Permission[] }> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/permissions/permissions/${permissionId}/children`
    );

    const rawData = await response.json();

    if (!response.ok) {
      throw new Error(rawData.message || 'Failed to fetch child permissions');
    }

    return {
      status: rawData.status || 200,
      message: rawData.message || 'Child permissions retrieved successfully',
      data: Array.isArray(rawData.data) ? rawData.data : []
    };
  } catch (error) {
    console.error('Error fetching child permissions:', error);
    throw error;
  }
}

export async function getParentPermissions(
  permissionId: number
): Promise<{ status: number; message: string; data: Permission[] }> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/permissions/permissions/${permissionId}/parents`
    );

    const rawData = await response.json();

    if (!response.ok) {
      throw new Error(rawData.message || 'Failed to fetch parent permissions');
    }

    return {
      status: rawData.status || 200,
      message: rawData.message || 'Parent permissions retrieved successfully',
      data: Array.isArray(rawData.data) ? rawData.data : []
    };
  } catch (error) {
    console.error('Error fetching parent permissions:', error);
    throw error;
  }
}
