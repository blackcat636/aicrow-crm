"use client"
export const runtime = 'edge';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getExecutionById } from '@/lib/api/executions';
import { Execution } from '@/interface/Execution';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  IconArrowLeft, 
  IconServer, 
  IconActivity, 
  IconCalendar,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconClock,
  IconPlayerStop,
  IconCode,
  IconCurrencyDollar,
  IconDatabase,
  IconExternalLink
} from '@tabler/icons-react';
import Link from 'next/link';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <IconCircleCheckFilled className="h-4 w-4 text-green-500" />
    case 'error':
      return <IconCircleXFilled className="h-4 w-4 text-red-500" />
    case 'canceled':
      return <IconPlayerStop className="h-4 w-4 text-orange-500" />
    case 'running':
      return <IconClock className="h-4 w-4 text-blue-500 animate-spin" />
    case 'waiting':
      return <IconClock className="h-4 w-4 text-yellow-500" />
    default:
      return <IconClock className="h-4 w-4 text-gray-500" />
  }
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'success':
      return 'default' as const
    case 'error':
      return 'destructive' as const
    case 'canceled':
      return 'secondary' as const
    case 'running':
      return 'outline' as const
    case 'waiting':
      return 'outline' as const
    default:
      return 'outline' as const
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'success':
      return 'Success'
    case 'error':
      return 'Error'
    case 'canceled':
      return 'Canceled'
    case 'running':
      return 'Running'
    case 'waiting':
      return 'Waiting'
    default:
      return status
  }
}

const formatDuration = (duration: number) => {
  if (duration < 1000) {
    return `${duration}ms`
  } else if (duration < 60000) {
    return `${(duration / 1000).toFixed(1)}s`
  } else {
    return `${(duration / 60000).toFixed(1)}m`
  }
}

export default function ExecutionDetailPage() {
  const params = useParams();
  const executionId = parseInt(params.id as string);
  
  const [execution, setExecution] = useState<Execution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExecution = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getExecutionById(executionId);
        
        if (response.status === 200 && response.data) {
          setExecution(response.data);
        } else {
          setError(response.message || 'Failed to load execution');
        }
      } catch (err) {
        console.error('Error fetching execution:', err);
        setError('Failed to load execution');
      } finally {
        setIsLoading(false);
      }
    };

    if (executionId) {
      fetchExecution();
    }
  }, [executionId]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading execution...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !execution) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'Execution not found'}</p>
            <Link href="/executions">
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
      <div className="@container/main flex flex-1 flex-col gap-6 px-6 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/executions">
              <Button variant="ghost" size="lg" className="group">
                <IconArrowLeft className="!h-10 !w-10 transition-transform group-hover:-translate-x-1" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Execution #{String(execution.id)}</h1>
              <p className="text-muted-foreground">
                n8n ID: {execution.n8nId} • Workflow: {execution.workflow?.name || execution.workflowName || 'Unknown'} • Instance: {execution.instance?.name || 'Unknown'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {execution.workflowInternalId && (
              <Button variant="outline" asChild>
                <Link href={`/workflows/${execution.workflowInternalId}`}>
                  <IconExternalLink className="h-4 w-4 mr-2" />
                  View Workflow
                </Link>
              </Button>
            )}
            <Badge 
              variant={getStatusBadgeVariant(execution.status)}
              className="px-3 py-1"
            >
              {getStatusIcon(execution.status)}
              <span className="ml-1">{getStatusText(execution.status)}</span>
            </Badge>
          </div>
        </div>

        {/* Execution Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Instance</CardTitle>
              <IconServer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{execution.instance?.name || 'Unknown'}</div>
              <p className="text-xs text-muted-foreground">
                {execution.instance?.apiUrl || 'Unknown'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <IconActivity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(execution.duration)}</div>
              <p className="text-xs text-muted-foreground">
                {execution.finished ? 'Completed' : 'In progress'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Price</CardTitle>
              <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${execution.priceUsd || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Execution cost
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Started</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(execution.startedAt).toLocaleDateString('uk-UA')}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(execution.startedAt).toLocaleTimeString('uk-UA')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mode</CardTitle>
              <IconCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{execution.mode}</div>
              <p className="text-xs text-muted-foreground">
                Execution mode
              </p>
            </CardContent>
          </Card>
        </div>

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
                  <p className="text-muted-foreground">{execution.instance?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="font-medium">API URL</p>
                  <p className="text-muted-foreground">{execution.instance?.apiUrl || 'Unknown'}</p>
                </div>
                <div>
                  <p className="font-medium">Default</p>
                  <p className="text-muted-foreground">
                    {execution.instance?.isDefault ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Active</p>
                  <p className="text-muted-foreground">
                    {execution.instance?.isActive ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Total Workflows</p>
                  <p className="text-muted-foreground">{execution.instance?.totalWorkflows || 0}</p>
                </div>
                <div>
                  <p className="font-medium">Total Executions</p>
                  <p className="text-muted-foreground">{execution.instance?.totalExecutions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Execution Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconActivity className="h-4 w-4" />
                Execution Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Workflow ID</p>
                  <p className="text-muted-foreground">{execution.workflowId}</p>
                </div>
                <div>
                  <p className="font-medium">Workflow Name</p>
                  <p className="text-muted-foreground">
                    {execution.workflow?.name || execution.workflowName || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Nodes Count</p>
                  <p className="text-muted-foreground">{String(execution.nodesCount)}</p>
                </div>
                <div>
                  <p className="font-medium">Executed Nodes</p>
                  <p className="text-muted-foreground">{String(execution.executedNodes)}</p>
                </div>
                <div>
                  <p className="font-medium">Data Size</p>
                  <p className="text-muted-foreground">{execution.dataSize} bytes</p>
                </div>
                <div>
                  <p className="font-medium">Has Large Data</p>
                  <p className="text-muted-foreground">
                    {execution.hasLargeData ? 'Yes' : 'No'}
                  </p>
                </div>
                {execution.stoppedAt && (
                  <div>
                    <p className="font-medium">Stopped At</p>
                    <p className="text-muted-foreground">
                      {new Date(execution.stoppedAt).toLocaleString('uk-UA')}
                    </p>
                  </div>
                )}
                {execution.waitingTill && (
                  <div>
                    <p className="font-medium">Waiting Till</p>
                    <p className="text-muted-foreground">
                      {new Date(execution.waitingTill).toLocaleString('uk-UA')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Information */}
        {execution.status === 'error' && (execution.errorMessage || execution.errorStack) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <IconCircleXFilled className="h-4 w-4" />
                Error Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {execution.errorMessage && (
                <div>
                  <p className="font-medium">Error Message</p>
                  <p className="text-muted-foreground bg-red-50 dark:bg-red-950 p-3 rounded-md">
                    {execution.errorMessage}
                  </p>
                </div>
              )}
              {execution.errorStack && (
                <div>
                  <p className="font-medium">Error Stack</p>
                  <pre className="text-muted-foreground bg-red-50 dark:bg-red-950 p-3 rounded-md text-xs overflow-auto">
                    {execution.errorStack}
                  </pre>
                </div>
              )}
              {execution.failedNode && (
                <div>
                  <p className="font-medium">Failed Node</p>
                  <p className="text-muted-foreground">{execution.failedNode}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Data Information */}
        {(execution.inputData || execution.outputData) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconDatabase className="h-4 w-4" />
                Execution Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {execution.inputData && (
                <div>
                  <p className="font-medium">Input Data</p>
                  <pre className="text-muted-foreground bg-muted p-3 rounded-md text-xs overflow-auto max-h-64">
                    {JSON.stringify(execution.inputData, null, 2)}
                  </pre>
                </div>
              )}
              {execution.outputData && (
                <div>
                  <p className="font-medium">Output Data</p>
                  <pre className="text-muted-foreground bg-muted p-3 rounded-md text-xs overflow-auto max-h-64">
                    {JSON.stringify(execution.outputData, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
