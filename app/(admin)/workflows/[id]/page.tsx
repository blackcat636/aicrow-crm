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
  IconPlayerStop,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight
} from '@tabler/icons-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditWorkflowDialog } from '@/components/workflows/edit-workflow-dialog';
import { WorkflowFormBuilder } from '@/components/workflows/workflow-form-builder';
import { WorkflowMultiSelect } from '@/components/workflows/workflow-multi-select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateWorkflow, getAllWorkflows, getChainableWorkflows } from '@/lib/api/workflows';
import { ChainableWorkflowsConfig } from '@/interface/Workflow';
import { toast } from 'sonner';
import { IconCheck } from '@tabler/icons-react';
import Link from 'next/link';

export default function WorkflowDetailPage() {
  const params = useParams();
  const workflowId = parseInt(params.id as string);
  
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExecutions, setIsLoadingExecutions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionsPage, setExecutionsPage] = useState(1);
  const [executionsLimit, setExecutionsLimit] = useState(10);
  const [executionsTotalPages, setExecutionsTotalPages] = useState(0);
  
  // Chainable Workflows state
  const [chainableWorkflows, setChainableWorkflows] = useState<ChainableWorkflowsConfig | null>(null);
  const [availableWorkflows, setAvailableWorkflows] = useState<Workflow[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [isSavingChainable, setIsSavingChainable] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoadingChainable, setIsLoadingChainable] = useState(false);
  // Store raw JSON text for each workflow to allow editing even with invalid JSON
  const [dataMappingTexts, setDataMappingTexts] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getWorkflowById(workflowId);
        
        if (response.status === 200 && response.data) {
          setWorkflow(response.data);
          setChainableWorkflows(response.data.chainableWorkflows || null);
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
        const response = await getAllExecutions(executionsPage, executionsLimit, { workflowId: workflow.n8nId });
        
        if (response.status === 200) {
          setExecutions(response.data.items);
          setExecutionsTotalPages(response.data.totalPages || 0);
        }
      } catch (err) {
        console.error('Failed to fetch executions:', err);
      } finally {
        setIsLoadingExecutions(false);
      }
    };

    fetchExecutions();
  }, [workflow?.n8nId, executionsPage, executionsLimit]);

  // Load available workflows for chainable workflows
  useEffect(() => {
    if (workflow) {
      fetchAvailableWorkflows();
    }
  }, [workflow]);

  // Load chainable workflows configuration when Chain Management tab is opened
  useEffect(() => {
    if (activeTab === 'chain-management' && workflowId) {
      const fetchChainableWorkflows = async () => {
        setIsLoadingChainable(true);
        try {
          const response = await getChainableWorkflows(workflowId);
          if (response.status === 200 && response.data) {
            const config = response.data.chainableWorkflows || null;
            setChainableWorkflows(config);
            // Initialize data mapping texts from the config
            if (config?.defaultDataMapping && config.allowedTargets) {
              const texts: Record<number, string> = {};
              config.allowedTargets.forEach((workflowId) => {
                const mapping = config.defaultDataMapping || {};
                let workflowMapping: Record<string, string> = {};
                
                if (typeof mapping === 'object' && mapping !== null && !Array.isArray(mapping)) {
                  if (mapping[workflowId] && typeof mapping[workflowId] === 'object') {
                    workflowMapping = mapping[workflowId] as Record<string, string>;
                  } else if (Object.keys(mapping).length > 0) {
                    const keys = Object.keys(mapping);
                    if (keys.every(k => isNaN(Number(k)))) {
                      workflowMapping = mapping as Record<string, string>;
                    }
                  }
                }
                
                texts[workflowId] = Object.keys(workflowMapping).length > 0
                  ? JSON.stringify(workflowMapping, null, 2)
                  : '';
              });
              setDataMappingTexts(texts);
            }
          }
        } catch (error) {
          console.error('Error fetching chainable workflows:', error);
          toast.error('Failed to load chainable workflows configuration');
        } finally {
          setIsLoadingChainable(false);
        }
      };

      fetchChainableWorkflows();
    }
  }, [activeTab, workflowId]);

  const fetchAvailableWorkflows = async () => {
    setIsLoadingWorkflows(true);
    try {
      const response = await getAllWorkflows({ 
        limit: 100,
        active: true 
      });
      if (response.status === 200 || response.status === 0) {
        setAvailableWorkflows(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  const handleSaveChainableWorkflows = async () => {
    if (!workflow) return;
    
    setIsSavingChainable(true);
    try {
      const result = await updateWorkflow(workflow.id, {
        chainableWorkflows: chainableWorkflows
      });
      
      if (result.status === 200) {
        toast.success('Chainable workflows configuration saved successfully!');
        setWorkflow(result.data);
        setChainableWorkflows(result.data.chainableWorkflows || null);
      } else {
        toast.error(result.message || 'Failed to save chainable workflows');
      }
    } catch (error) {
      console.error('Error saving chainable workflows:', error);
      toast.error('Error saving chainable workflows');
    } finally {
      setIsSavingChainable(false);
    }
  };

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
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Link href="/workflows">
              <Button variant="ghost" size="icon">
                <IconArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold break-words">{workflow.displayName || workflow.name || 'Unknown'}</h1>
              <p className="text-muted-foreground">
                Workflow ID: {String(workflow.id)} • n8n ID: {workflow.n8nId || 'Unknown'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col gap-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="form-builder">Form Builder</TabsTrigger>
            <TabsTrigger value="chain-management">Chain Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex flex-col gap-6">
            {/* Workflow Info Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Instance</CardTitle>
                  <IconServer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {workflow.instance?.name || 'Unknown'}
                  </div>
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
                  <div className="text-2xl font-bold">
                    {String(workflow.nodes)}
                  </div>
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
                  <CardTitle className="text-sm font-medium">
                    Last Updated
                  </CardTitle>
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="font-medium text-sm">Display Name</p>
                    <p className="break-words text-muted-foreground">
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
                    <p className="break-words text-muted-foreground">
                      {workflow.displayDescription || 'No description provided'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Available to Users</p>
                    <Badge
                      variant={workflow.availableToUsers ? 'default' : 'outline'}
                    >
                      {workflow.availableToUsers ? 'Yes' : 'No'}
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
                        {typeof tag === 'string'
                          ? tag
                          : String(
                              (tag as Record<string, unknown>)?.name ||
                                (tag as Record<string, unknown>)?.title ||
                                tag,
                            )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Information */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                      <p className="text-muted-foreground">
                        {workflow.instance?.name || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">API URL</p>
                      <p className="text-muted-foreground">
                        {workflow.instance?.apiUrl || 'Unknown'}
                      </p>
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
                      <p className="text-muted-foreground">
                        {workflow.instance?.totalWorkflows || 0}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Total Executions</p>
                      <p className="text-muted-foreground">
                        {workflow.instance?.totalExecutions || 0}
                      </p>
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
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm text-muted-foreground">
                      Loading executions...
                    </span>
                  </div>
                ) : executions.length > 0 ? (
                  <div className="space-y-3">
                    {executions.map((execution) => (
                      <div
                        key={execution.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {execution.status === 'success' && (
                              <IconCircleCheckFilled className="h-4 w-4 text-green-500" />
                            )}
                            {execution.status === 'error' && (
                              <IconCircleXFilled className="h-4 w-4 text-red-500" />
                            )}
                            {execution.status === 'running' && (
                              <IconClock className="h-4 w-4 animate-spin text-blue-500" />
                            )}
                            {execution.status === 'canceled' && (
                              <IconPlayerStop className="h-4 w-4 text-orange-500" />
                            )}
                            <Badge
                              variant={
                                execution.status === 'success'
                                  ? 'default'
                                  : execution.status === 'error'
                                  ? 'destructive'
                                  : execution.status === 'running'
                                  ? 'outline'
                                  : 'secondary'
                              }
                            >
                              {execution.status}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">#{execution.id}</span>
                            <span className="ml-2 text-muted-foreground">
                              {new Date(execution.startedAt).toLocaleString('uk-UA')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {execution.duration < 1000
                              ? `${execution.duration}ms`
                              : execution.duration < 60000
                              ? `${(execution.duration / 1000).toFixed(1)}s`
                              : `${(execution.duration / 60000).toFixed(1)}m`}
                          </span>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/executions/${execution.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    {executionsTotalPages > 1 && (
                      <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="executions-per-page" className="text-sm">
                            Rows per page:
                          </Label>
                          <Select
                            value={`${executionsLimit}`}
                            onValueChange={(value) => {
                              setExecutionsLimit(Number(value));
                              setExecutionsPage(1);
                            }}
                          >
                            <SelectTrigger id="executions-per-page" className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[5, 10, 20, 50].map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          Page {executionsPage} of {executionsTotalPages}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => setExecutionsPage(1)}
                            disabled={executionsPage === 1 || isLoadingExecutions}
                          >
                            <span className="sr-only">Go to first page</span>
                            <IconChevronsLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => setExecutionsPage(prev => Math.max(1, prev - 1))}
                            disabled={executionsPage === 1 || isLoadingExecutions}
                          >
                            <span className="sr-only">Previous page</span>
                            <IconChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          {/* Page number buttons */}
                          {(() => {
                            const pageCount = executionsTotalPages;
                            const currentPage = executionsPage;
                            const maxVisible = 7;
                            const pages: (number | string)[] = [];
                            
                            if (pageCount <= maxVisible) {
                              // Show all pages
                              for (let i = 1; i <= pageCount; i++) {
                                pages.push(i);
                              }
                            } else {
                              // Show first page
                              if (currentPage <= 3) {
                                for (let i = 1; i <= 5; i++) {
                                  pages.push(i);
                                }
                                pages.push('...');
                                pages.push(pageCount);
                              }
                              // Show middle pages
                              else if (currentPage >= pageCount - 2) {
                                pages.push(1);
                                pages.push('...');
                                for (let i = pageCount - 4; i <= pageCount; i++) {
                                  pages.push(i);
                                }
                              }
                              // Show around current
                              else {
                                pages.push(1);
                                pages.push('...');
                                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                                  pages.push(i);
                                }
                                pages.push('...');
                                pages.push(pageCount);
                              }
                            }
                            
                            return pages.map((page, idx) => (
                              page === '...' ? (
                                <span key={`ellipsis-${idx}`} className="px-2">
                                  ...
                                </span>
                              ) : (
                                <Button
                                  key={page}
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setExecutionsPage(page as number)}
                                  disabled={isLoadingExecutions}
                                >
                                  {page}
                                </Button>
                              )
                            ));
                          })()}
                          
                          <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => setExecutionsPage(prev => Math.min(executionsTotalPages, prev + 1))}
                            disabled={executionsPage >= executionsTotalPages || isLoadingExecutions}
                          >
                            <span className="sr-only">Next page</span>
                            <IconChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="hidden size-8 lg:flex"
                            size="icon"
                            onClick={() => setExecutionsPage(executionsTotalPages)}
                            disabled={executionsPage >= executionsTotalPages || isLoadingExecutions}
                          >
                            <span className="sr-only">Go to last page</span>
                            <IconChevronsRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="pt-2 text-center">
                      <Button variant="outline" asChild>
                        <Link href={`/executions?workflowId=${workflow.n8nId}`}>
                          View All Executions
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No executions found for this workflow
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="form-builder" className="flex flex-col gap-4">
            <WorkflowFormBuilder workflow={workflow} />
          </TabsContent>

          <TabsContent value="chain-management" className="flex flex-col gap-4">
            {/* Chainable Workflows Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconSettings className="h-4 w-4" />
                  Chainable Workflows Configuration
                </CardTitle>
                <CardDescription>
                  Configure which workflows can receive results from this workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingChainable ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm text-muted-foreground">
                      Loading chainable workflows configuration...
                    </span>
                  </div>
                ) : (
                  <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enableChainableWorkflows"
                        checked={chainableWorkflows !== null}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setChainableWorkflows({
                              allowedTargets: [],
                              defaultDataMapping: {}
                            });
                            setDataMappingTexts({});
                          } else {
                            setChainableWorkflows(null);
                            setDataMappingTexts({});
                          }
                        }}
                      />
                      <Label htmlFor="enableChainableWorkflows" className="text-base font-medium cursor-pointer">
                        Configure workflow chains
                      </Label>
                    </div>
                    {chainableWorkflows !== null && (
                      <Button
                        onClick={handleSaveChainableWorkflows}
                        disabled={isSavingChainable}
                        size="sm"
                      >
                        {isSavingChainable ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <IconCheck className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground ml-10">
                    If enabled, restricts which workflows can receive results from this workflow.
                    If disabled, users can chain to any attached workflow.
                  </p>
                </div>

                {chainableWorkflows !== null && (
                  <div className="space-y-6 pt-4 border-t">
                    {/* Add Child Workflows */}
                    <div className="space-y-2">
                      <Label className="text-base">Add Child Workflows</Label>
                      {isLoadingWorkflows ? (
                        <p className="text-sm text-muted-foreground">Loading workflows...</p>
                      ) : (
                        <WorkflowMultiSelect
                          workflows={availableWorkflows}
                          selectedIds={chainableWorkflows.allowedTargets || []}
                          currentWorkflowId={workflow.id}
                          onChange={(selectedIds) => {
                            setChainableWorkflows({
                              ...chainableWorkflows,
                              allowedTargets: selectedIds
                            });
                            // Clear texts for removed workflows
                            setDataMappingTexts(prev => {
                              const newTexts = { ...prev };
                              Object.keys(newTexts).forEach(key => {
                                if (!selectedIds.includes(Number(key))) {
                                  delete newTexts[Number(key)];
                                }
                              });
                              return newTexts;
                            });
                          }}
                        />
                      )}
                      <p className="text-xs text-muted-foreground">
                        Select child workflows that can receive results from this workflow.
                      </p>
                    </div>

                    <Separator />

                    {/* Configure Child Workflows */}
                    {chainableWorkflows.allowedTargets && chainableWorkflows.allowedTargets.length > 0 && (
                      <div className="space-y-4">
                        <Label className="text-base">Configure Child Workflows</Label>
                        <p className="text-xs text-muted-foreground">
                          Configure data transfer processing for each child workflow.
                        </p>
                        
                        {chainableWorkflows.allowedTargets.map((childWorkflowId) => {
                          const childWorkflow = availableWorkflows.find(w => w.id === childWorkflowId);
                          const workflowName = childWorkflow?.displayName || childWorkflow?.name || `Workflow #${childWorkflowId}`;
                          
                          // Get mapping for this specific workflow
                          // Structure: defaultDataMapping is stored as { [workflowId]: { mapping } }
                          const currentMapping = chainableWorkflows.defaultDataMapping || {};
                          let workflowMapping: Record<string, string> = {};
                          
                          if (typeof currentMapping === 'object' && currentMapping !== null && !Array.isArray(currentMapping)) {
                            // Check if it's stored per workflow: { [workflowId]: { mapping } }
                            if (currentMapping[childWorkflowId] && typeof currentMapping[childWorkflowId] === 'object') {
                              workflowMapping = currentMapping[childWorkflowId] as Record<string, string>;
                            } else if (Object.keys(currentMapping).length > 0) {
                              // Legacy: single mapping object used for all workflows
                              // Check if keys are not numeric (workflow IDs) - then it's a legacy mapping
                              const keys = Object.keys(currentMapping);
                              if (keys.every(k => isNaN(Number(k)))) {
                                workflowMapping = currentMapping as Record<string, string>;
                              }
                            }
                          }
                          
                          return (
                            <Card key={childWorkflowId}>
                              <CardHeader>
                                <CardTitle className="text-sm flex items-center justify-between">
                                  <span>{workflowName} (ID: {childWorkflowId})</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newTargets = (chainableWorkflows.allowedTargets || []).filter(id => id !== childWorkflowId);
                                      // Also remove mapping for this workflow
                                      const currentMapping = chainableWorkflows.defaultDataMapping || {};
                                      const updatedMapping = { ...currentMapping };
                                      if (updatedMapping[childWorkflowId]) {
                                        delete updatedMapping[childWorkflowId];
                                      }
                                      
                                      setChainableWorkflows({
                                        ...chainableWorkflows,
                                        allowedTargets: newTargets,
                                        defaultDataMapping: Object.keys(updatedMapping).length > 0 ? updatedMapping : {}
                                      });
                                    }}
                                  >
                                    <IconX className="h-4 w-4" />
                                  </Button>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <Label className="text-sm">Data Transfer Processing (JSON)</Label>
                                <p className="text-xs text-muted-foreground">
                                  Configure how data should be transformed when chaining to this workflow.
                                </p>
                                <Textarea
                                  value={dataMappingTexts[childWorkflowId] ?? (
                                    typeof workflowMapping === 'object' && workflowMapping !== null && Object.keys(workflowMapping).length > 0
                                      ? JSON.stringify(workflowMapping, null, 2)
                                      : ''
                                  )}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    
                                    // Always update the text state to allow editing
                                    setDataMappingTexts(prev => ({
                                      ...prev,
                                      [childWorkflowId]: value
                                    }));
                                    
                                    // Try to parse and update the mapping if valid JSON
                                    try {
                                      const trimmed = value.trim();
                                      let parsed: Record<string, string> = {};
                                      
                                      if (trimmed === '' || trimmed === '{}') {
                                        parsed = {};
                                      } else {
                                        parsed = JSON.parse(trimmed);
                                      }
                                      
                                      // Update mapping for this specific workflow
                                      // Store as: { [workflowId]: { mapping } }
                                      const currentMapping = chainableWorkflows.defaultDataMapping || {};
                                      const updatedMapping = {
                                        ...currentMapping,
                                        [childWorkflowId]: parsed
                                      };
                                      
                                      setChainableWorkflows({
                                        ...chainableWorkflows,
                                        defaultDataMapping: updatedMapping
                                      });
                                    } catch {
                                      // Invalid JSON - text is already saved in dataMappingTexts
                                      // User can continue editing and fix it
                                    }
                                  }}
                                  placeholder='{"prompt": "{{resultData.data.text}}", "imageUrl": "{{resultData.data.imageUrl}}"}' 
                                  rows={6}
                                  className="font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Use template syntax: {"{{resultData.path.to.data}}"} to reference result data.
                                </p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}

                    {(!chainableWorkflows.allowedTargets || chainableWorkflows.allowedTargets.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No child workflows added yet.</p>
                        <p className="text-xs mt-1">Add child workflows above to configure them.</p>
                      </div>
                    )}
                  </div>
                )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
