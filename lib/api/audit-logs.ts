import { fetchWithAuth } from '../api';
import {
  AuditLogFilters,
  AuditLogsApiResponse,
  AuditLogApiResponse
} from '@/interface/AuditLog';

// Remove trailing slash from API_URL to avoid double slashes
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
).replace(/\/+$/, '');

export async function getAllAuditLogs(
  filters: AuditLogFilters = {}
): Promise<AuditLogsApiResponse> {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      userEmail,
      entityType,
      entityId,
      actionType,
      actionCategory,
      dateFrom,
      dateTo,
      success,
      search,
      isAdminAction,
      isSystem
    } = filters;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (userId !== undefined) {
      params.append('userId', userId.toString());
    }
    if (userEmail) {
      params.append('userEmail', userEmail);
    }
    if (entityType) {
      params.append('entityType', entityType);
    }
    if (entityId !== undefined) {
      params.append('entityId', entityId.toString());
    }
    if (actionType) {
      params.append('actionType', actionType);
    }
    if (actionCategory) {
      params.append('actionCategory', actionCategory);
    }
    if (dateFrom) {
      params.append('dateFrom', dateFrom);
    }
    if (dateTo) {
      params.append('dateTo', dateTo);
    }
    if (success !== undefined) {
      params.append('success', success.toString());
    }
    if (search) {
      params.append('search', search);
    }
    if (isAdminAction !== undefined) {
      params.append('isAdminAction', isAdminAction.toString());
    }
    if (isSystem !== undefined) {
      params.append('isSystem', isSystem.toString());
    }

    const url = `${API_URL}/admin/audit-logs?${params}`;
    const response = await fetchWithAuth(url);

    const data = await response.json();

    if (!response.ok) {
      return {
        status: response.status,
        message: data.message || 'Failed to fetch audit logs',
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
          availableFilters: {
            actionTypes: [],
            actionCategories: [],
            entityTypes: [],
            userRoles: [],
            dateRange: {
              min: '',
              max: ''
            }
          }
        }
      };
    }

    return {
      status: response.status,
      message: data.message || 'Audit logs fetched successfully',
      data: data.data
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return {
      status: 500,
      message:
        error instanceof Error ? error.message : 'Failed to fetch audit logs',
      data: {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        availableFilters: {
          actionTypes: [],
          actionCategories: [],
          entityTypes: [],
          userRoles: [],
          dateRange: {
            min: '',
            max: ''
          }
        }
      }
    };
  }
}

export async function getAuditLogsByUserId(
  userId: number,
  filters: Omit<AuditLogFilters, 'userId' | 'userEmail'> = {}
): Promise<AuditLogsApiResponse> {
  try {
    const {
      page = 1,
      limit = 20,
      entityType,
      entityId,
      actionType,
      actionCategory,
      dateFrom,
      dateTo,
      success,
      search,
      isAdminAction,
      isSystem
    } = filters;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (entityType) {
      params.append('entityType', entityType);
    }
    if (entityId !== undefined) {
      params.append('entityId', entityId.toString());
    }
    if (actionType) {
      params.append('actionType', actionType);
    }
    if (actionCategory) {
      params.append('actionCategory', actionCategory);
    }
    if (dateFrom) {
      params.append('dateFrom', dateFrom);
    }
    if (dateTo) {
      params.append('dateTo', dateTo);
    }
    if (success !== undefined) {
      params.append('success', success.toString());
    }
    if (search) {
      params.append('search', search);
    }
    if (isAdminAction !== undefined) {
      params.append('isAdminAction', isAdminAction.toString());
    }
    if (isSystem !== undefined) {
      params.append('isSystem', isSystem.toString());
    }

    const url = `${API_URL}/admin/audit-logs/user/${userId}?${params}`;
    const response = await fetchWithAuth(url);

    const data = await response.json();

    if (!response.ok) {
      return {
        status: response.status,
        message: data.message || 'Failed to fetch audit logs',
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
          availableFilters: {
            actionTypes: [],
            actionCategories: [],
            entityTypes: [],
            userRoles: [],
            dateRange: {
              min: '',
              max: ''
            }
          }
        }
      };
    }

    return {
      status: response.status,
      message: data.message || 'Audit logs fetched successfully',
      data: data.data
    };
  } catch (error) {
    console.error('Error fetching audit logs by user ID:', error);
    return {
      status: 500,
      message:
        error instanceof Error ? error.message : 'Failed to fetch audit logs',
      data: {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        availableFilters: {
          actionTypes: [],
          actionCategories: [],
          entityTypes: [],
          userRoles: [],
          dateRange: {
            min: '',
            max: ''
          }
        }
      }
    };
  }
}

export async function getAuditLogsByEntity(
  entityType: string,
  entityId: number,
  filters: Omit<AuditLogFilters, 'entityType' | 'entityId'> = {}
): Promise<AuditLogsApiResponse> {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      userEmail,
      actionType,
      actionCategory,
      dateFrom,
      dateTo,
      success,
      search,
      isAdminAction,
      isSystem
    } = filters;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (userId !== undefined) {
      params.append('userId', userId.toString());
    }
    if (userEmail) {
      params.append('userEmail', userEmail);
    }
    if (actionType) {
      params.append('actionType', actionType);
    }
    if (actionCategory) {
      params.append('actionCategory', actionCategory);
    }
    if (dateFrom) {
      params.append('dateFrom', dateFrom);
    }
    if (dateTo) {
      params.append('dateTo', dateTo);
    }
    if (success !== undefined) {
      params.append('success', success.toString());
    }
    if (search) {
      params.append('search', search);
    }
    if (isAdminAction !== undefined) {
      params.append('isAdminAction', isAdminAction.toString());
    }
    if (isSystem !== undefined) {
      params.append('isSystem', isSystem.toString());
    }

    const response = await fetchWithAuth(
      `${API_URL}/admin/audit-logs/entity/${entityType}/${entityId}?${params}`
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        status: response.status,
        message: data.message || 'Failed to fetch audit logs',
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
          availableFilters: {
            actionTypes: [],
            actionCategories: [],
            entityTypes: [],
            userRoles: [],
            dateRange: {
              min: '',
              max: ''
            }
          }
        }
      };
    }

    return {
      status: response.status,
      message: data.message || 'Audit logs fetched successfully',
      data: data.data
    };
  } catch (error) {
    console.error('Error fetching audit logs by entity:', error);
    return {
      status: 500,
      message:
        error instanceof Error ? error.message : 'Failed to fetch audit logs',
      data: {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        availableFilters: {
          actionTypes: [],
          actionCategories: [],
          entityTypes: [],
          userRoles: [],
          dateRange: {
            min: '',
            max: ''
          }
        }
      }
    };
  }
}

export async function getAuditLogById(
  id: number
): Promise<AuditLogApiResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/audit-logs/${id}`);

    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.message || `Failed to fetch audit log with id ${id}`
      );
    }

    const data = (await response.json()) as AuditLogApiResponse;

    // Check if successful status (200 or 0)
    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(
        data.message || `Failed to fetch audit log with id ${id}`
      );
    }
  } catch (error) {
    console.error('Error fetching audit log by id:', error);
    throw error;
  }
}
