"use client";

import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { usePermission } from '@/hooks/use-permission';

type TabsContentProps = React.ComponentProps<typeof TabsContent>;

interface PermissionTabProps extends TabsContentProps {
  permission: string;
}

/**
 * TabsContent that renders only when the user has the given permission.
 */
export function PermissionTab({ permission, children, ...props }: PermissionTabProps) {
  const allowed = usePermission(permission);

  if (!allowed) {
    return null;
  }

  return <TabsContent {...props}>{children}</TabsContent>;
}
