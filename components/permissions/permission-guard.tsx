"use client";

import React from 'react';
import { usePermission } from '@/hooks/use-permission';

interface PermissionGuardProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Guards UI fragments by permission.
 * Hides children if permission is missing; optionally renders fallback.
 */
export function PermissionGuard({
  permission,
  fallback = null,
  children
}: PermissionGuardProps) {
  const allowed = usePermission(permission);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
