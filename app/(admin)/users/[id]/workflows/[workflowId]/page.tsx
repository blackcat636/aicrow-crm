"use client"

export const runtime = 'edge';

import { use, useEffect, useState } from 'react';
import { useRouter } from "next/navigation"
import { useUserWorkflowsStore } from "@/store/useUserWorkflowsStore"
import { getWorkflowExecutions } from "@/lib/api/user-workflows"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  IconArrowLeft, 
  IconTrash, 
  IconSettings, 
  IconActivity, 
  IconClock, 
  IconCircleCheckFilled, 
  IconCircleX,
  IconEdit,
  IconDeviceFloppy
} from "@tabler/icons-react"
import { toast } from "sonner"

interface PageProps {
  params: Promise<{ id: string; workflowId: string }>
}

export default function UserWorkflowDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const userId = parseInt(resolvedParams.id);
  const workflowId = parseInt(resolvedParams.workflowId);
  const router = useRouter();
  
  const { userWorkflows, deleteWorkflow, fetchUserWorkflows, updateWorkflow } = useUserWorkflowsStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [executions, setExecutions] = useState<Record<string, unknown>[]>([])
  const [executionsLoading, setExecutionsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: false,
    scheduleType: 'manual' as 'manual' | 'cron' | 'interval',
  })
  
  const workflow = userWorkflows.find(w => w.id === workflowId)

  // Load workflows and executions
  useEffect(() => {
    const loadData = async () => {
      if (userId) {
        await fetchUserWorkflows(userId)
        setIsLoading(false)
      }
      
      // Load executions for this workflow
      setExecutionsLoading(true)
      try {
        const response = await getWorkflowExecutions(workflowId, 1, 5)
        if (response.status === 200 || response.status === 0) {
          const data = response.data as Record<string, unknown>
          const isArrayResponse = Array.isArray(data)
          setExecutions(isArrayResponse ? data : (data.items as Record<string, unknown>[]) || [])
        }
      } catch {
        toast.error('Failed to load executions')
      } finally {
        setExecutionsLoading(false)
      }
    }
    loadData()
  }, [userId, workflowId, fetchUserWorkflows])

  // Update form when workflow is loaded
  useEffect(() => {
    if (workflow) {
      setFormData({
        name: workflow.name || '',
        description: workflow.description || '',
        isActive: workflow.isActive ?? false,
        scheduleType: (workflow.scheduleType as 'manual' | 'cron' | 'interval') || 'manual',
      })
    }
  }, [workflow])


  const handleDeleteConfirm = async () => {
    setIsSubmitting(true)
    try {
      const success = await deleteWorkflow(workflowId)
      if (success) {
        toast.success('Workflow deleted successfully')
        router.push(`/user-workflows?userId=${userId}`)
      } else {
        toast.error('Failed to delete workflow')
        setShowDeleteDialog(false)
      }
    } catch {
      toast.error('Error deleting workflow')
      setShowDeleteDialog(false)
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await updateWorkflow(workflowId, {
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        scheduleType: formData.scheduleType,
      })
      if (result) {
        toast.success('Workflow updated successfully')
        setShowEditForm(false)
        await fetchUserWorkflows(userId)
      } else {
        toast.error('Failed to update workflow')
      }
    } catch {
      toast.error('Error updating workflow')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Loading workflow...</p>
          <p className="text-sm text-muted-foreground">Please wait</p>
        </div>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Workflow not found</p>
          <p className="text-sm text-muted-foreground">Workflow ID: {workflowId}</p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/user-workflows?userId=${userId}`)}
          >
            Back to Workflows
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <IconArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {workflow?.name || workflow?.workflow?.name || 'Workflow Details'}
              </h1>
              <p className="text-muted-foreground">
                Workflow ID: {workflowId} • User ID: {userId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditForm(true)}
            >
              <IconEdit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Edit Form */}
        {showEditForm && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Workflow</CardTitle>
              <CardDescription>
                Update the workflow configuration and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter workflow name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter workflow description"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduleType">Schedule Type</Label>
                  <Select
                    value={formData.scheduleType}
                    onValueChange={(value) => setFormData({ ...formData, scheduleType: value as 'manual' | 'cron' | 'interval' })}
                  >
                    <SelectTrigger id="scheduleType">
                      <SelectValue placeholder="Select schedule type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="cron">Cron</SelectItem>
                      <SelectItem value="interval">Interval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Workflow Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Workflow Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconSettings className="h-5 w-5" />
                Workflow Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">
                    {workflow?.name || workflow?.workflow?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge 
                      variant={workflow?.isActive ? "default" : "outline"}
                      className={workflow?.isActive ? "bg-green-500" : ""}
                    >
                      {workflow?.isActive ? (
                        <IconCircleCheckFilled className="mr-1 h-3 w-3" />
                      ) : (
                        <IconCircleX className="mr-1 h-3 w-3" />
                      )}
                      {workflow?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Schedule Type</Label>
                  <p className="font-medium">{workflow?.scheduleType || 'Manual'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Executed</Label>
                  <p className="font-medium">
                    {workflow?.lastExecutedAt
                      ? new Date(workflow.lastExecutedAt).toLocaleString('uk-UA')
                      : 'Never'}
                  </p>
                </div>
              </div>
              {workflow?.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1">{workflow.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconActivity className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {workflow?.totalExecutions ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Executions</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {workflow?.successfulExecutions ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Successful</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {workflow?.failedExecutions ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {workflow?.totalExecutions ? 
                      Math.round(((workflow.successfulExecutions ?? 0) / workflow.totalExecutions) * 100) : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconActivity className="h-5 w-5" />
              Recent Executions
            </CardTitle>
            <CardDescription>
              Latest workflow executions and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {executionsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading executions...</p>
              </div>
            ) : executions.length === 0 ? (
              <div className="text-center py-8">
                <IconActivity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Executions</h3>
                <p className="text-sm text-muted-foreground">
                  This workflow hasn&apos;t been executed yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {executions.map((execution) => (
                  <div
                    key={execution.id as string}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {execution.status === 'success' ? (
                          <IconCircleCheckFilled className="h-5 w-5 text-green-500" />
                        ) : execution.status === 'error' ? (
                          <IconCircleX className="h-5 w-5 text-red-500" />
                        ) : (
                          <IconClock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Execution #{execution.id as string}</span>
                          <Badge
                            variant={
                              execution.status === 'success' ? 'default' :
                              execution.status === 'error' ? 'destructive' : 'outline'
                            }
                            className={
                              execution.status === 'success' ? 'bg-green-500' :
                              execution.status === 'error' ? 'bg-red-500' : ''
                            }
                          >
                            {execution.status as string}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Started: {execution.startedAt ? new Date(execution.startedAt as string).toLocaleString('uk-UA') : 'N/A'}
                          {execution.stoppedAt ? (
                            <> • Duration: {Number(execution.duration)}ms</>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {execution.mode ? (
                        <div>Mode: {String(execution.mode)}</div>
                      ) : null}
                      {execution.executedNodes && execution.nodesCount ? (
                        <div>
                          {Number(execution.executedNodes)}/{Number(execution.nodesCount)} nodes
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog 
          open={showDeleteDialog} 
          onOpenChange={(open) => {
            if (!isSubmitting) {
              setShowDeleteDialog(open)
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the workflow
                <span className="font-semibold"> &quot;{workflow?.workflow?.name || 'Unknown'}&quot;</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}