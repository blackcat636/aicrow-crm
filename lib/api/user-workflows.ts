import { fetchWithAuth } from '../api';
import {
  UserWorkflowsApiResponse,
  UserWorkflowApiResponse,
  CreateUserWorkflowDto,
  UpdateUserWorkflowDto,
  ToggleUserWorkflowResponse
} from '@/interface/UserWorkflow';

// Remove trailing slash from API_URL to avoid double slashes
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
).replace(/\/+$/, '');

/**
 * Attach workflow to user
 * POST /admin/automations/user-workflows/[workflowId]
 */
export async function attachWorkflowToUser(
  workflowId: number,
  data: {
    name: string;
    description: string;
    isActive: boolean;
    scheduleType: 'manual' | 'scheduled' | 'triggered';
  }
): Promise<UserWorkflowApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/automations/user-workflows/${workflowId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflowId,
          ...data
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to attach workflow to user');
    }

    const result = (await response.json()) as UserWorkflowApiResponse;

    if (result.status === 200 || result.status === 0 || result.status === 201) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to attach workflow to user');
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get user workflow by workflow ID
 * GET /admin/automations/user-workflows/[workflowId]
 */
export async function getUserWorkflowByWorkflowId(
  workflowId: number
): Promise<UserWorkflowApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/automations/user-workflows/${workflowId}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch user workflow');
    }

    const result = (await response.json()) as UserWorkflowApiResponse;

    if (result.status === 200 || result.status === 0) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to fetch user workflow');
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get all user workflows for a specific user
 * GET /admin/automations/users/:userId/workflows
 */
export async function getUserWorkflows(
  userId: number,
  page: number = 1,
  limit: number = 10
): Promise<UserWorkflowsApiResponse> {
  const url = `${API_URL}/admin/automations/users/${userId}/workflows?page=${page}&limit=${limit}`;

  try {
    const response = await fetchWithAuth(url);
    const data = (await response.json()) as UserWorkflowsApiResponse;

    if (!response.ok) {
      return {
        status: response.status,
        message: data.message || 'Failed to fetch user workflows',
        data: {
          items: [],
          total: 0,
          page: 0,
          limit: 0,
          totalPages: 0
        }
      };
    }

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      return {
        status: data.status || 500,
        message: data.message || 'Failed to fetch user workflows',
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

/**
 * Create a new user workflow
 * POST /admin/automations/users/:userId/workflows
 */
export async function createUserWorkflow(
  userId: number,
  data: CreateUserWorkflowDto
): Promise<UserWorkflowApiResponse> {
  const url = `${API_URL}/admin/automations/users/${userId}/workflows`;

  try {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = 'Failed to create user workflow';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Use default error message
        console.error('Error parsing error response:', e);
      }

      throw new Error(errorMessage);
    }

    const result = JSON.parse(responseText) as UserWorkflowApiResponse;

    if (result.status === 200 || result.status === 0 || result.status === 201) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to create user workflow');
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update an existing user workflow
 * PUT /admin/automations/user-workflows/:id
 */
export async function updateUserWorkflow(
  id: number,
  data: UpdateUserWorkflowDto
): Promise<UserWorkflowApiResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/automations/user-workflows/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update user workflow');
    }

    const result = (await response.json()) as UserWorkflowApiResponse;

    if (result.status === 200 || result.status === 0) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to update user workflow');
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a user workflow
 * DELETE /admin/automations/user-workflows/:id
 */
export async function deleteUserWorkflow(
  id: number
): Promise<{ status: number; message?: string }> {
  const url = `${API_URL}/admin/automations/user-workflows/${id}`;

  try {
    const response = await fetchWithAuth(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete user workflow');
    }

    const result = await response.json();

    if (result.status === 200 || result.status === 0) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to delete user workflow');
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Toggle user workflow active status
 * PATCH /admin/automations/user-workflows/:id/toggle
 */
export async function toggleUserWorkflow(
  id: number
): Promise<ToggleUserWorkflowResponse> {
  const url = `${API_URL}/admin/automations/user-workflows/${id}/toggle`;

  try {
    const response = await fetchWithAuth(url, {
      method: 'PATCH'
    });

    if (!response.ok) {
      throw new Error('Failed to toggle user workflow');
    }

    const result = (await response.json()) as ToggleUserWorkflowResponse;

    if (result.status === 200 || result.status === 0) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to toggle user workflow');
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get workflow executions
 * GET /admin/automations/user-workflows/:id/executions
 */
export async function getWorkflowExecutions(
  workflowId: number,
  page: number = 1,
  limit: number = 10
): Promise<Record<string, unknown>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/automations/user-workflows/${workflowId}/executions?page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch workflow executions');
    }

    const data = await response.json();

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to fetch workflow executions');
    }
  } catch (error) {
    console.error('Error fetching workflow executions:', error);
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
export async function getUserExecutionsUserSide(
  page: number = 1,
  limit: number = 10
): Promise<Record<string, unknown>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/automations/user/executions?page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user executions');
    }

    const data = await response.json();

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to fetch user executions');
    }
  } catch (error) {
    console.error('Error fetching user executions:', error);
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

/**
 * Get user executions (admin-side API)
 * GET /admin/automations/users/:userId/executions
 */
export async function getUserExecutions(
  userId: number,
  page: number = 1,
  limit: number = 10
): Promise<Record<string, unknown>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/automations/users/${userId}/executions?page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user executions');
    }

    const data = await response.json();

    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to fetch user executions');
    }
  } catch (error) {
    console.error('Error fetching user executions:', error);
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
