import { fetchWithAuth } from '../api';
import { RolesApiResponse, RoleApiResponse, Role } from '@/interface/Role';

export async function getAllRoles(): Promise<RolesApiResponse> {
  try {
    const response = await fetchWithAuth('/api/admin/permissions/roles');
    const rawData = await response.json();

    if (!response.ok) {
      return {
        status: response.status,
        message: rawData.message || 'Failed to fetch roles',
        data: [],
        total: 0,
        page: 0,
        limit: 0
      };
    }

    const data: RolesApiResponse = {
      status: rawData.status || 200,
      message: rawData.message || 'Roles retrieved successfully',
      data: Array.isArray(rawData.data) ? rawData.data : [],
      total: rawData.total || 0,
      page: rawData.page || 1,
      limit: rawData.limit || 100
    };

    return data;
  } catch (error) {
    console.error('Error fetching roles:', error);
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

export async function getRoleById(id: number): Promise<RoleApiResponse> {
  try {
    const response = await fetchWithAuth(`/api/admin/permissions/roles/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch role with id ${id}`);
    }
    const data = (await response.json()) as RoleApiResponse;
    return data;
  } catch (error) {
    console.error('Error fetching role by id:', error);
    throw error;
  }
}

export async function createRole(roleData: {
  name: string;
  description: string;
  permissionIds?: number[];
  conditions?: Record<string, unknown> | null;
}): Promise<RoleApiResponse> {
  try {
    const response = await fetchWithAuth('/api/admin/permissions/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roleData)
    });

    const data = (await response.json()) as RoleApiResponse;

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create role');
    }

    return data;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
}

export async function updateRole(
  id: number,
  roleData: {
    name?: string;
    description?: string;
    permissionIds?: number[];
    conditions?: Record<string, unknown> | null;
  }
): Promise<RoleApiResponse> {
  try {
    const response = await fetchWithAuth(`/api/admin/permissions/roles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roleData)
    });

    const data = (await response.json()) as RoleApiResponse;

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update role');
    }

    return data;
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
}

export async function deleteRole(
  id: number
): Promise<{ status: number; message: string }> {
  try {
    const response = await fetchWithAuth(`/api/admin/permissions/roles/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete role');
    }

    return data;
  } catch (error) {
    console.error('Error deleting role:', error);
    throw error;
  }
}

export async function addChildRole(
  parentRoleId: number,
  childRoleId: number
): Promise<{ status: number; message: string; data?: unknown }> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/permissions/roles/${parentRoleId}/children`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parentRoleId,
          childRoleId
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add child role');
    }

    return data;
  } catch (error) {
    console.error('Error adding child role:', error);
    throw error;
  }
}

export async function removeChildRole(
  parentRoleId: number,
  childRoleId: number
): Promise<{ status: number; message: string }> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/permissions/roles/${parentRoleId}/children/${childRoleId}`,
      {
        method: 'DELETE'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove child role');
    }

    return data;
  } catch (error) {
    console.error('Error removing child role:', error);
    throw error;
  }
}

export async function getChildRoles(
  roleId: number
): Promise<{ status: number; message: string; data: Role[] }> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/permissions/roles/${roleId}/children`
    );

    const rawData = await response.json();

    if (!response.ok) {
      throw new Error(rawData.message || 'Failed to fetch child roles');
    }

    // Handle different response formats:
    // 1. Direct array: [...]
    // 2. Wrapped object: { status, message, data: [...] }
    let childrenData: Role[] = [];

    if (Array.isArray(rawData)) {
      // Direct array response
      childrenData = rawData;
    } else if (rawData.data && Array.isArray(rawData.data)) {
      // Wrapped response with data field
      childrenData = rawData.data;
    } else if (rawData.data === null || rawData.data === undefined) {
      // Empty data field
      childrenData = [];
    }

    return {
      status: rawData.status || 200,
      message: rawData.message || 'Child roles retrieved successfully',
      data: childrenData
    };
  } catch (error) {
    console.error('Error fetching child roles:', error);
    throw error;
  }
}

export async function getParentRoles(
  roleId: number
): Promise<{ status: number; message: string; data: Role[] }> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/permissions/roles/${roleId}/parents`
    );

    const rawData = await response.json();

    if (!response.ok) {
      throw new Error(rawData.message || 'Failed to fetch parent roles');
    }

    return {
      status: rawData.status || 200,
      message: rawData.message || 'Parent roles retrieved successfully',
      data: Array.isArray(rawData.data) ? rawData.data : []
    };
  } catch (error) {
    console.error('Error fetching parent roles:', error);
    throw error;
  }
}

export async function getRoleEffectivePermissions(
  roleId: number
): Promise<{ status: number; message: string; data: unknown[] }> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/permissions/roles/${roleId}/effective-permissions`
    );

    const rawData = await response.json();

    if (!response.ok) {
      throw new Error(
        rawData.message || 'Failed to fetch effective permissions'
      );
    }

    return {
      status: rawData.status || 200,
      message:
        rawData.message || 'Effective permissions retrieved successfully',
      data: Array.isArray(rawData.data) ? rawData.data : []
    };
  } catch (error) {
    console.error('Error fetching effective permissions:', error);
    throw error;
  }
}

// Assign role to user
export async function assignRoleToUser(
  userId: number,
  roleData: {
    roleId: number;
    resourceFilters?: Record<string, unknown>;
    expiresAt?: string;
  }
): Promise<{ status: number; message: string; data?: unknown }> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/permissions/users/${userId}/roles`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to assign role to user');
    }

    return data;
  } catch (error) {
    console.error('Error assigning role to user:', error);
    throw error;
  }
}

// Remove role from user
export async function removeRoleFromUser(
  userId: number,
  roleId: number
): Promise<{ status: number; message: string }> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/permissions/users/${userId}/roles/${roleId}`,
      {
        method: 'DELETE'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove role from user');
    }

    return data;
  } catch (error) {
    console.error('Error removing role from user:', error);
    throw error;
  }
}

// Get user roles
export async function getUserRoles(userId: number): Promise<{
  status: number;
  message: string;
  data: unknown[];
  total: number;
}> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/permissions/users/${userId}/roles`
    );

    const rawData = await response.json();

    if (!response.ok) {
      throw new Error(rawData.message || 'Failed to fetch user roles');
    }

    return {
      status: rawData.status || 200,
      message: rawData.message || 'User roles retrieved successfully',
      data: Array.isArray(rawData.data) ? rawData.data : [],
      total: rawData.total || 0
    };
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
}

// Get user permissions
export async function getUserPermissions(userId: number): Promise<{
  status: number;
  message: string;
  data: unknown[];
  total: number;
}> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/permissions/users/${userId}/permissions`
    );

    const rawData = await response.json();

    if (!response.ok) {
      throw new Error(rawData.message || 'Failed to fetch user permissions');
    }

    return {
      status: rawData.status || 200,
      message: rawData.message || 'User permissions retrieved successfully',
      data: Array.isArray(rawData.data) ? rawData.data : [],
      total: rawData.total || 0
    };
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    throw error;
  }
}
