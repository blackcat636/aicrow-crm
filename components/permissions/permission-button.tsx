"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/use-permission';

type ButtonProps = React.ComponentProps<typeof Button>;

interface PermissionButtonProps extends ButtonProps {
  permission: string;
}

/**
 * Button that renders only when the user has the given permission.
 */
export function PermissionButton({ permission, ...props }: PermissionButtonProps) {
  const allowed = usePermission(permission);

  if (!allowed) {
    return null;
  }

  return <Button {...props} />;
}
