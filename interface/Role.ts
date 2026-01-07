import { Permission } from './Permission';

export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  permission: Permission;
  conditions: any | null;
  isActive: boolean;
  createdAt?: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  isSystem: boolean;
  isHierarchical?: boolean;
  rolePermissions?: RolePermission[];
  createdAt?: string;
  updatedAt?: string;
  children?: Role[];
  parentRoles?: Role[];
}

export interface RolesApiResponse {
  status: number;
  message: string;
  data: Role[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface RoleApiResponse {
  status: number;
  message: string;
  data: Role;
}

export interface RoleHierarchy {
  id: number;
  parentRoleId: number;
  childRoleId: number;
  isActive: boolean;
  createdAt?: string;
}

export interface UserRole {
  id?: number;
  roleId: number;
  userId?: number;
  role?: Role | string;
  resourceFilters?: Record<string, any> | null;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
