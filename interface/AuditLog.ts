export interface AuditLog {
  id: number;
  userId: number | null;
  userEmail: string | null;
  userRole: string | null;
  actionType: string;
  actionCategory: string;
  entityType: string;
  entityId: number;
  description: string;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  changes: string[] | null;
  ipAddress: string;
  userAgent: string;
  requestMethod: string;
  requestPath: string;
  requestId: string;
  metadata: Record<string, any> | null;
  success: boolean;
  errorMessage: string | null;
  isAdminAction?: boolean;
  isSystem?: boolean;
  createdAt: string;
}

export interface AuditLogFilters {
  userId?: number;
  userEmail?: string;
  entityType?: string;
  entityId?: number;
  actionType?: string;
  actionCategory?: string;
  dateFrom?: string;
  dateTo?: string;
  success?: boolean;
  search?: string;
  isAdminAction?: boolean;
  isSystem?: boolean;
  page?: number;
  limit?: number;
}

export interface AvailableFilters {
  actionTypes: string[];
  actionCategories: string[];
  entityTypes: string[];
  userRoles: string[];
  dateRange: {
    min: string;
    max: string;
  };
}

export interface AuditLogsResponse {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  availableFilters: AvailableFilters;
}

export interface AuditLogsApiResponse {
  status: number;
  message: string;
  data: AuditLogsResponse;
}

export interface AuditLogApiResponse {
  status: number;
  message: string;
  data: AuditLog;
}

