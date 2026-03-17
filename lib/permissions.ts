import { Permission } from '@/interface/Permission';
import { useUserPermissionsStore } from '@/store/useUserPermissionsStore';

/**
 * Normalizes permission target string to lower case trimmed form.
 */
const normalizeTarget = (target: string) => target.trim().toLowerCase();

/**
 * Builds a list of comparable keys for a permission entry.
 * Includes name, resource:action, and resource-only forms.
 */
const extractPermissionKeys = (permission: Permission): string[] => {
  const keys: string[] = [];

  if (permission.name) {
    keys.push(normalizeTarget(permission.name));
  }

  if (permission.resource && permission.action) {
    keys.push(normalizeTarget(`${permission.resource}:${permission.action}`));
  }

  if (permission.resource) {
    keys.push(normalizeTarget(permission.resource));
  }

  return keys;
};

/**
 * Matches wildcard target "resource:*" against permission's resource:action.
 */
const matchWildcard = (target: string, permission: Permission) => {
  if (!target.includes(':*')) {
    return false;
  }

  const [resource] = target.split(':*');
  return permission.resource?.toLowerCase() === resource.trim().toLowerCase();
};

/**
 * Checks if current user has a given permission.
 * Supported formats:
 * - permission name: "users.view"
 * - resource:action: "users:view"
 * - wildcard for resource: "users:*"
 */
export const hasPermission = (permissionName: string): boolean => {
  if (!permissionName || typeof permissionName !== 'string') {
    return false;
  }

  const target = normalizeTarget(permissionName);
  const { permissions } = useUserPermissionsStore.getState();

  if (!permissions || permissions.length === 0) {
    return false;
  }

  return permissions.some((permission) => {
    // Skip inactive permissions if flag is present
    if (permission.isActive === false) {
      return false;
    }

    if (matchWildcard(target, permission)) {
      return true;
    }

    const keys = extractPermissionKeys(permission);
    return keys.includes(target);
  });
};

/**
 * Utility to expose current permission list for advanced scenarios.
 */
export const getUserPermissions = (): Permission[] =>
  useUserPermissionsStore.getState().permissions;
