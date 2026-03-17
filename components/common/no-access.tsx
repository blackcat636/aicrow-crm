"use client";

import React from "react";

interface NoAccessProps {
  title?: string;
  message?: string;
  note?: string;
}

export function NoAccess({
  title = "No access",
  message = "You don't have permission to view this content.",
  note = "Please contact an administrator to request access."
}: NoAccessProps) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      <div className="font-semibold">{title}</div>
      <div className="text-muted-foreground">{message}</div>
      <div className="text-xs text-muted-foreground mt-1">{note}</div>
    </div>
  );
}
