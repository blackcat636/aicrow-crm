"use client"
export const runtime = 'edge';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getWorkflowById } from '@/lib/api/workflows';
import { getAllExecutions } from '@/lib/api/executions';
import { Workflow } from '@/interface/Workflow';
import { Execution } from '@/interface/Execution';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  IconArrowLeft, 
  IconSettings, 
  IconServer, 
  IconActivity, 
  IconCalendar,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconTag,
  IconClock,
  IconPlayerStop
} from '@tabler/icons-react';
import { EditWorkflowDialog } from '@/components/workflows/edit-workflow-dialog';
import Link from 'next/link';

export default function WorkflowDetailPage() {
  const params = useParams();
  const workflowId = parseInt(params.id as string);
  
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExecutions, setIsLoadingExecutions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getWorkflowById(workflowId);
        
        if (response.status === 200 && response.data) {
          setWorkflow(response.data);
        } else {
          setError(response.message || 'Failed to load workflow');
        }
      } catch (err) {
        console.error('Error fetching workflow:', err);
        setError('Failed to load workflow');
      } finally {
        setIsLoading(false);
      }
    };

    if (workflowId) {
      fetchWorkflow();
    }
  }, [workflowId]);

  useEffect(() => {
    const fetchExecutions = async () => {
      if (!workflow?.n8nId) return;
      
      try {
        setIsLoadingExecutions(true);
        const response = await getAllExecutions(1, 10, { workflowId: workflow.n8nId });
        
        if (response.status === 200) {
          setExecutions(response.data.items);
        }
      } catch (err) {
        console.error('Failed to fetch executions:', err);
      } finally {
        setIsLoadingExecutions(false);
      }
    };

    fetchExecutions();
  }, [workflow?.n8nId]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading workflow...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'Workflow not found'}</p>
            <Link href="/workflows">
              <Button variant="outline">
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Back to list
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 px-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/workflows">
              <Button variant="ghost" size="icon">
                <IconArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{workflow.name || 'Unknown'}</h1>
              <p className="text-muted-foreground">
                Workflow ID: {String(workflow.id)} • n8n ID: {workflow.n8nId || 'Unknown'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EditWorkflowDialog 
              workflow={workflow} 
              onWorkflowUpdated={(updatedWorkflow) => setWorkflow(updatedWorkflow)}
            />
            <Badge 
              variant={workflow.active ? "default" : "outline"}
              className="px-3 py-1"
            >
              {workflow.active ? (
                <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 mr-1 h-3 w-3" />
              ) : (
                <IconCircleCheckFilled className="fill-red-500 dark:fill-red-400 mr-1 h-3 w-3" />
              )}
              {workflow.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        {/* Workflow Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Instance</CardTitle>
              <IconServer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workflow.instance?.name || 'Unknown'}</div>
              <p className="text-xs text-muted-foreground">
                {workflow.instance?.apiUrl || 'Unknown'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nodes</CardTitle>
              <IconActivity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{String(workflow.nodes)}</div>
              <p className="text-xs text-muted-foreground">
                {String(workflow.connections)} connections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(workflow.createdAt).toLocaleDateString('uk-UA')}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(workflow.createdAt).toLocaleTimeString('uk-UA')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(workflow.updatedAt).toLocaleDateString('uk-UA')}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(workflow.updatedAt).toLocaleTimeString('uk-UA')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSettings className="h-4 w-4" />
              Workflow Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-sm">Display Name</p>
                <p className="text-muted-foreground break-words">
                  {workflow.displayName || 'Not set'}
                </p>
              </div>
              <div>
                <p className="font-medium text-sm">Price</p>
                <p className="text-muted-foreground">
                  {workflow.priceUsd ? `$${workflow.priceUsd}` : 'Free'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium text-sm">Description</p>
                <p className="text-muted-foreground break-words">
                  {workflow.displayDescription || 'No description provided'}
                </p>
              </div>
              <div>
                <p className="font-medium text-sm">Available to Users</p>
                <Badge variant={workflow.availableToUsers ? "default" : "outline"}>
                  {workflow.availableToUsers ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {workflow.tags && workflow.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconTag className="h-4 w-4" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {workflow.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {typeof tag === 'string' ? tag : String((tag as Record<string, unknown>)?.name || (tag as Record<string, unknown>)?.title || tag)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instance Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconServer className="h-4 w-4" />
                Instance Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Name</p>
                  <p className="text-muted-foreground">{workflow.instance?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="font-medium">API URL</p>
                  <p className="text-muted-foreground">{workflow.instance?.apiUrl || 'Unknown'}</p>
                </div>
                <div>
                  <p className="font-medium">Default</p>
                  <p className="text-muted-foreground">
                    {workflow.instance?.isDefault ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Active</p>
                  <p className="text-muted-foreground">
                    {workflow.instance?.isActive ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Total Workflows</p>
                  <p className="text-muted-foreground">{workflow.instance?.totalWorkflows || 0}</p>
                </div>
                <div>
                  <p className="font-medium">Total Executions</p>
                  <p className="text-muted-foreground">{workflow.instance?.totalExecutions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconSettings className="h-4 w-4" />
                Workflow Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Project ID</p>
                  <p className="text-muted-foreground">
                    {workflow.projectId || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">n8n Created</p>
                  <p className="text-muted-foreground">
                    {new Date(workflow.n8nCreatedAt).toLocaleString('uk-UA')}
                  </p>
                </div>
                <div>
                  <p className="font-medium">n8n Updated</p>
                  <p className="text-muted-foreground">
                    {new Date(workflow.n8nUpdatedAt).toLocaleString('uk-UA')}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Last Synced</p>
                  <p className="text-muted-foreground">
                    {new Date(workflow.syncedAt).toLocaleString('uk-UA')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconActivity className="h-4 w-4" />
              Recent Executions
            </CardTitle>
            <CardDescription>
              Latest executions for this workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingExecutions ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Loading executions...</span>
              </div>
            ) : executions.length > 0 ? (
              <div className="space-y-3">
                {executions.slice(0, 5).map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {execution.status === 'success' && <IconCircleCheckFilled className="h-4 w-4 text-green-500" />}
                        {execution.status === 'error' && <IconCircleXFilled className="h-4 w-4 text-red-500" />}
                        {execution.status === 'running' && <IconClock className="h-4 w-4 text-blue-500 animate-spin" />}
                        {execution.status === 'canceled' && <IconPlayerStop className="h-4 w-4 text-orange-500" />}
                        <Badge variant={
                          execution.status === 'success' ? 'default' :
                          execution.status === 'error' ? 'destructive' :
                          execution.status === 'running' ? 'outline' : 'secondary'
                        }>
                          {execution.status}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">#{execution.id}</span>
                        <span className="text-muted-foreground ml-2">
                          {new Date(execution.startedAt).toLocaleString('uk-UA')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {execution.duration < 1000 ? `${execution.duration}ms` : 
                         execution.duration < 60000 ? `${(execution.duration / 1000).toFixed(1)}s` : 
                         `${(execution.duration / 60000).toFixed(1)}m`}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/executions/${execution.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {executions.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" asChild>
                      <Link href={`/executions?workflowId=${workflow.n8nId}`}>
                        View All Executions
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No executions found for this workflow
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
