export interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description: string;
  isActive?: boolean;
  isSystem?: boolean;
  isHierarchical?: boolean;
  createdAt?: string;
  updatedAt?: string;
  children?: Permission[];
  parentPermissions?: Permission[];
}

export interface PermissionsApiResponse {
  status: number;
  message: string;
  data: Permission[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface PermissionApiResponse {
  status: number;
  message: string;
  data: Permission;
}

export interface PermissionHierarchy {
  id: number;
  parentPermissionId: number;
  childPermissionId: number;
  isActive: boolean;
  createdAt?: string;
}
