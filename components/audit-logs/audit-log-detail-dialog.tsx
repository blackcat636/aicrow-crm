"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AuditLog } from "@/interface/AuditLog"
import { getUserInfoFromLog } from "@/components/audit-logs/utils"
import {
  IconCircleXFilled,
  IconUser,
  IconShield,
  IconGlobe,
  IconFileText,
  IconCode,
} from "@tabler/icons-react"

interface AuditLogDetailDialogProps {
  log: AuditLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type AuditLogRecord = Record<string, unknown> | null

// Sanitize sensitive data
const sanitizeData = (data: AuditLogRecord): AuditLogRecord => {
  if (!data) return null;
  
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'refreshToken', 'accessToken'];
  const sanitized: Record<string, unknown> = { ...data };
  
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '***HIDDEN***';
    }
  });
  
  return sanitized;
};

// Format JSON for display
const formatJson = (obj: unknown): string => {
  if (!obj) return 'null';
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
};

export function AuditLogDetailDialog({
  log,
  open,
  onOpenChange,
}: AuditLogDetailDialogProps) {
  if (!log) return null;

  const sanitizedOldValues = sanitizeData(log.oldValues);
  const sanitizedNewValues = sanitizeData(log.newValues);
  const sanitizedMetadata = sanitizeData(log.metadata);
  const userInfo = getUserInfoFromLog(log);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Audit Log Details
            <Badge variant={log.success ? "default" : "destructive"}>
              {log.success ? "Success" : "Failed"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            ID: {log.id} • Created: {new Date(log.createdAt).toLocaleString('uk-UA')}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto pr-4">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <IconUser className="h-4 w-4" />
                User Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {userInfo.id !== null && (
                  <div>
                    <span className="text-muted-foreground">User ID:</span>
                    <p className="font-medium">{userInfo.id}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{userInfo.name}</p>
                </div>
                {userInfo.email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{userInfo.email}</p>
                  </div>
                )}
                {userInfo.role && (
                  <div>
                    <span className="text-muted-foreground">Role:</span>
                    <div className="flex items-center gap-2 mt-1">
                      {userInfo.role === 'admin' ? (
                        <IconShield className="h-4 w-4" />
                      ) : (
                        <IconUser className="h-4 w-4" />
                      )}
                      <Badge variant={userInfo.role === 'admin' ? "default" : "outline"}>
                        {userInfo.role}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Action Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <IconFileText className="h-4 w-4" />
                Action Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Action Type:</span>
                  <p className="font-medium">
                    <Badge variant="outline">{log.actionType}</Badge>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <p className="font-medium">
                    <Badge variant="secondary">{log.actionCategory}</Badge>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Entity Type:</span>
                  <p className="font-medium">{log.entityType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Entity ID:</span>
                  <p className="font-medium font-mono">{log.entityId}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Description:</span>
                  <p className="font-medium mt-1">{log.description}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Request Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <IconGlobe className="h-4 w-4" />
                Request Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Method:</span>
                  <p className="font-medium font-mono">{log.requestMethod}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Path:</span>
                  <p className="font-medium font-mono text-xs break-all">{log.requestPath}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">IP Address:</span>
                  <p className="font-medium font-mono">{log.ipAddress}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Request ID:</span>
                  <p className="font-medium font-mono text-xs">{log.requestId}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">User Agent:</span>
                  <p className="font-medium text-xs break-all mt-1">{log.userAgent}</p>
                </div>
              </div>
            </div>

            {/* Changes */}
            {log.changes && log.changes.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Changed Fields</h3>
                  <div className="flex flex-wrap gap-2">
                    {log.changes.map((change, index) => (
                      <Badge key={index} variant="outline">
                        {change}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Old Values */}
            {sanitizedOldValues && Object.keys(sanitizedOldValues).length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <IconCode className="h-4 w-4" />
                    Old Values
                  </h3>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-xs overflow-x-auto">
                      {formatJson(sanitizedOldValues)}
                    </pre>
                  </div>
                </div>
              </>
            )}

            {/* New Values */}
            {sanitizedNewValues && Object.keys(sanitizedNewValues).length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <IconCode className="h-4 w-4" />
                    New Values
                  </h3>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-xs overflow-x-auto">
                      {formatJson(sanitizedNewValues)}
                    </pre>
                  </div>
                </div>
              </>
            )}

            {/* Metadata */}
            {sanitizedMetadata && Object.keys(sanitizedMetadata).length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <IconCode className="h-4 w-4" />
                    Metadata
                  </h3>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-xs overflow-x-auto">
                      {formatJson(sanitizedMetadata)}
                    </pre>
                  </div>
                </div>
              </>
            )}

            {/* Error Message */}
            {log.errorMessage && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <IconCircleXFilled className="h-4 w-4" />
                    Error Message
                  </h3>
                  <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-md">
                    <p className="text-sm text-destructive">{log.errorMessage}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

