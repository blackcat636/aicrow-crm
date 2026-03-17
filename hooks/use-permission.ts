"use client";

import { useMemo } from 'react';
import { hasPermission } from '@/lib/permissions';
import { useUserPermissionsStore } from '@/store/useUserPermissionsStore';

/**
 * Hook for checking if current user has specific permission.
 */
export const usePermission = (permissionName: string): boolean => {
  const { permissions, isLoading } = useUserPermissionsStore();

  return useMemo(() => {
    if (isLoading) {
      return false;
    }
    return hasPermission(permissionName);
  }, [permissions, isLoading, permissionName]);
};
