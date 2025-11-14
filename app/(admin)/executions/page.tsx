"use client"

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useExecutionsStore } from '@/store/useExecutionsStore'
import { ExecutionsDataTable } from '@/components/executions/executions-data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IconActivity, IconClock, IconCircleCheckFilled, IconCircleXFilled } from '@tabler/icons-react'

export default function ExecutionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { 
    executions, 
    isLoading, 
    error, 
    total, 
    page, 
    limit, 
    totalPages,
    fetchExecutions,
    filters,
    setFilters
  } = useExecutionsStore()

  // Local state for filter inputs
  const [instanceIdInput, setInstanceIdInput] = useState<string>(filters.instanceId?.toString() || '');
  const [workflowIdInput, setWorkflowIdInput] = useState<string>(filters.workflowId || '');
  const [statusFilter, setStatusFilter] = useState<string>(filters.status || 'all');
  const [finishedFilter, setFinishedFilter] = useState<string>(filters.finished !== undefined ? filters.finished.toString() : 'all');
  const [hasErrorsFilter, setHasErrorsFilter] = useState<string>(filters.hasErrors !== undefined ? filters.hasErrors.toString() : 'all');
  const [isArchivedFilter, setIsArchivedFilter] = useState<string>(filters.isArchived !== undefined ? filters.isArchived.toString() : 'all');
  
  const previousUrlRef = useRef<string>('');
  const isInitializedRef = useRef(false);

  // Initialize URL with page and limit if not present
  useEffect(() => {
    if (!isInitializedRef.current) {
      const urlPage = searchParams.get('page');
      const urlLimit = searchParams.get('limit');
      
      // If page or limit are missing, add them to URL
      if (!urlPage || !urlLimit) {
        const params = new URLSearchParams();
        params.set('page', urlPage || '1');
        params.set('limit', urlLimit || '50');
        // Preserve existing filter params
        const urlInstanceId = searchParams.get('instanceId');
        const urlWorkflowId = searchParams.get('workflowId');
        const urlStatus = searchParams.get('status');
        const urlFinished = searchParams.get('finished');
        const urlHasErrors = searchParams.get('hasErrors');
        const urlIsArchived = searchParams.get('isArchived');
        if (urlInstanceId) params.set('instanceId', urlInstanceId);
        if (urlWorkflowId) params.set('workflowId', urlWorkflowId);
        if (urlStatus) params.set('status', urlStatus);
        if (urlFinished) params.set('finished', urlFinished);
        if (urlHasErrors) params.set('hasErrors', urlHasErrors);
        if (urlIsArchived) params.set('isArchived', urlIsArchived);
        
        const newUrl = `?${params.toString()}`;
        router.replace(`/executions${newUrl}`, { scroll: false });
        isInitializedRef.current = true;
        return;
      }
      isInitializedRef.current = true;
    }
  }, [searchParams, router]);

  // Sync URL → Store: Fetch data when URL changes
  useEffect(() => {
    if (!isInitializedRef.current) {
      return;
    }

    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlLimit = parseInt(searchParams.get('limit') || '50', 10);
    const urlInstanceId = searchParams.get('instanceId');
    const urlWorkflowId = searchParams.get('workflowId');
    const urlStatus = searchParams.get('status');
    const urlFinished = searchParams.get('finished');
    const urlHasErrors = searchParams.get('hasErrors');
    const urlIsArchived = searchParams.get('isArchived');
    
    // Parse filters from URL
    const parsedInstanceId = urlInstanceId ? parseInt(urlInstanceId, 10) : undefined;
    const parsedWorkflowId = urlWorkflowId || undefined;
    const parsedStatus = urlStatus || undefined;
    const parsedFinished = urlFinished !== null ? urlFinished === 'true' : undefined;
    const parsedHasErrors = urlHasErrors !== null ? urlHasErrors === 'true' : undefined;
    const parsedIsArchived = urlIsArchived !== null ? urlIsArchived === 'true' : undefined;
    
    // Update local state from URL
    if (parsedInstanceId !== undefined && parsedInstanceId.toString() !== instanceIdInput) {
      setInstanceIdInput(parsedInstanceId.toString());
    } else if (parsedInstanceId === undefined && instanceIdInput !== '') {
      setInstanceIdInput('');
    }
    
    if (parsedWorkflowId !== undefined && parsedWorkflowId !== workflowIdInput) {
      setWorkflowIdInput(parsedWorkflowId);
    } else if (parsedWorkflowId === undefined && workflowIdInput !== '') {
      setWorkflowIdInput('');
    }
    
    if (parsedStatus !== undefined && parsedStatus !== statusFilter) {
      setStatusFilter(parsedStatus);
    } else if (parsedStatus === undefined && statusFilter !== 'all') {
      setStatusFilter('all');
    }
    
    if (parsedFinished !== undefined && parsedFinished.toString() !== finishedFilter) {
      setFinishedFilter(parsedFinished.toString());
    } else if (parsedFinished === undefined && finishedFilter !== 'all') {
      setFinishedFilter('all');
    }
    
    if (parsedHasErrors !== undefined && parsedHasErrors.toString() !== hasErrorsFilter) {
      setHasErrorsFilter(parsedHasErrors.toString());
    } else if (parsedHasErrors === undefined && hasErrorsFilter !== 'all') {
      setHasErrorsFilter('all');
    }
    
    if (parsedIsArchived !== undefined && parsedIsArchived.toString() !== isArchivedFilter) {
      setIsArchivedFilter(parsedIsArchived.toString());
    } else if (parsedIsArchived === undefined && isArchivedFilter !== 'all') {
      setIsArchivedFilter('all');
    }
    
    // Build filters object
    const newFilters = {
      ...(parsedInstanceId !== undefined && { instanceId: parsedInstanceId }),
      ...(parsedWorkflowId && { workflowId: parsedWorkflowId }),
      ...(parsedStatus && { status: parsedStatus }),
      ...(parsedFinished !== undefined && { finished: parsedFinished }),
      ...(parsedHasErrors !== undefined && { hasErrors: parsedHasErrors }),
      ...(parsedIsArchived !== undefined && { isArchived: parsedIsArchived }),
    };
    
    // Create URL string for comparison
    const currentUrl = `page=${urlPage}&limit=${urlLimit}&instanceId=${parsedInstanceId ?? ''}&workflowId=${parsedWorkflowId ?? ''}&status=${parsedStatus ?? ''}&finished=${parsedFinished ?? ''}&hasErrors=${parsedHasErrors ?? ''}&isArchived=${parsedIsArchived ?? ''}`;
    
    // Only fetch if URL actually changed
    if (previousUrlRef.current !== currentUrl) {
      previousUrlRef.current = currentUrl;
      
      // Update store filters
      setFilters(newFilters);
      
      // Fetch data from URL params
      fetchExecutions(urlPage, urlLimit, newFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, fetchExecutions, setFilters]);

  const successCount = executions.filter(e => e.status === 'success').length
  const errorCount = executions.filter(e => e.status === 'error').length
  const runningCount = executions.filter(e => e.status === 'running').length

  const handleFiltersChange = () => {
    // Intentionally left blank: parent handles fetching via effects and store
  }

  const handlePageChange = (newPage: number) => {
    const urlLimit = parseInt(searchParams.get('limit') || '50', 10);
    const urlInstanceId = searchParams.get('instanceId');
    const urlWorkflowId = searchParams.get('workflowId');
    const urlStatus = searchParams.get('status');
    const urlFinished = searchParams.get('finished');
    const urlHasErrors = searchParams.get('hasErrors');
    const urlIsArchived = searchParams.get('isArchived');
    
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    params.set('limit', urlLimit.toString());
    if (urlInstanceId) params.set('instanceId', urlInstanceId);
    if (urlWorkflowId) params.set('workflowId', urlWorkflowId);
    if (urlStatus) params.set('status', urlStatus);
    if (urlFinished) params.set('finished', urlFinished);
    if (urlHasErrors) params.set('hasErrors', urlHasErrors);
    if (urlIsArchived) params.set('isArchived', urlIsArchived);

    const newUrl = `?${params.toString()}`;
    router.replace(`/executions${newUrl}`, { scroll: false });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const urlInstanceId = searchParams.get('instanceId');
    const urlWorkflowId = searchParams.get('workflowId');
    const urlStatus = searchParams.get('status');
    const urlFinished = searchParams.get('finished');
    const urlHasErrors = searchParams.get('hasErrors');
    const urlIsArchived = searchParams.get('isArchived');
    
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', newPageSize.toString());
    if (urlInstanceId) params.set('instanceId', urlInstanceId);
    if (urlWorkflowId) params.set('workflowId', urlWorkflowId);
    if (urlStatus) params.set('status', urlStatus);
    if (urlFinished) params.set('finished', urlFinished);
    if (urlHasErrors) params.set('hasErrors', urlHasErrors);
    if (urlIsArchived) params.set('isArchived', urlIsArchived);

    const newUrl = `?${params.toString()}`;
    router.replace(`/executions${newUrl}`, { scroll: false });
  };

  const handleInstanceIdChange = (value: string) => {
    setInstanceIdInput(value);
    const urlLimit = parseInt(searchParams.get('limit') || '50', 10);
    const urlWorkflowId = searchParams.get('workflowId');
    const urlStatus = searchParams.get('status');
    const urlFinished = searchParams.get('finished');
    const urlHasErrors = searchParams.get('hasErrors');
    const urlIsArchived = searchParams.get('isArchived');
    
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', urlLimit.toString());
    if (urlWorkflowId) params.set('workflowId', urlWorkflowId);
    if (urlStatus) params.set('status', urlStatus);
    if (urlFinished) params.set('finished', urlFinished);
    if (urlHasErrors) params.set('hasErrors', urlHasErrors);
    if (urlIsArchived) params.set('isArchived', urlIsArchived);
    if (value) {
      const instanceIdNum = parseInt(value, 10);
      if (!isNaN(instanceIdNum)) {
        params.set('instanceId', instanceIdNum.toString());
      }
    }

    const newUrl = `?${params.toString()}`;
    router.replace(`/executions${newUrl}`, { scroll: false });
  };

  const handleWorkflowIdChange = (value: string) => {
    setWorkflowIdInput(value);
    const urlLimit = parseInt(searchParams.get('limit') || '50', 10);
    const urlInstanceId = searchParams.get('instanceId');
    const urlStatus = searchParams.get('status');
    const urlFinished = searchParams.get('finished');
    const urlHasErrors = searchParams.get('hasErrors');
    const urlIsArchived = searchParams.get('isArchived');
    
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', urlLimit.toString());
    if (urlInstanceId) params.set('instanceId', urlInstanceId);
    if (urlStatus) params.set('status', urlStatus);
    if (urlFinished) params.set('finished', urlFinished);
    if (urlHasErrors) params.set('hasErrors', urlHasErrors);
    if (urlIsArchived) params.set('isArchived', urlIsArchived);
    if (value) {
      params.set('workflowId', value);
    }

    const newUrl = `?${params.toString()}`;
    router.replace(`/executions${newUrl}`, { scroll: false });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    const urlLimit = parseInt(searchParams.get('limit') || '50', 10);
    const urlInstanceId = searchParams.get('instanceId');
    const urlWorkflowId = searchParams.get('workflowId');
    const urlFinished = searchParams.get('finished');
    const urlHasErrors = searchParams.get('hasErrors');
    const urlIsArchived = searchParams.get('isArchived');
    
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', urlLimit.toString());
    if (urlInstanceId) params.set('instanceId', urlInstanceId);
    if (urlWorkflowId) params.set('workflowId', urlWorkflowId);
    if (urlFinished) params.set('finished', urlFinished);
    if (urlHasErrors) params.set('hasErrors', urlHasErrors);
    if (urlIsArchived) params.set('isArchived', urlIsArchived);
    if (value && value !== 'all') {
      params.set('status', value);
    }

    const newUrl = `?${params.toString()}`;
    router.replace(`/executions${newUrl}`, { scroll: false });
  };

  const handleFinishedChange = (value: string) => {
    setFinishedFilter(value);
    const urlLimit = parseInt(searchParams.get('limit') || '50', 10);
    const urlInstanceId = searchParams.get('instanceId');
    const urlWorkflowId = searchParams.get('workflowId');
    const urlStatus = searchParams.get('status');
    const urlHasErrors = searchParams.get('hasErrors');
    const urlIsArchived = searchParams.get('isArchived');
    
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', urlLimit.toString());
    if (urlInstanceId) params.set('instanceId', urlInstanceId);
    if (urlWorkflowId) params.set('workflowId', urlWorkflowId);
    if (urlStatus) params.set('status', urlStatus);
    if (urlHasErrors) params.set('hasErrors', urlHasErrors);
    if (urlIsArchived) params.set('isArchived', urlIsArchived);
    if (value && value !== 'all') {
      params.set('finished', value);
    }

    const newUrl = `?${params.toString()}`;
    router.replace(`/executions${newUrl}`, { scroll: false });
  };

  const handleHasErrorsChange = (value: string) => {
    setHasErrorsFilter(value);
    const urlLimit = parseInt(searchParams.get('limit') || '50', 10);
    const urlInstanceId = searchParams.get('instanceId');
    const urlWorkflowId = searchParams.get('workflowId');
    const urlStatus = searchParams.get('status');
    const urlFinished = searchParams.get('finished');
    const urlIsArchived = searchParams.get('isArchived');
    
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', urlLimit.toString());
    if (urlInstanceId) params.set('instanceId', urlInstanceId);
    if (urlWorkflowId) params.set('workflowId', urlWorkflowId);
    if (urlStatus) params.set('status', urlStatus);
    if (urlFinished) params.set('finished', urlFinished);
    if (urlIsArchived) params.set('isArchived', urlIsArchived);
    if (value && value !== 'all') {
      params.set('hasErrors', value);
    }

    const newUrl = `?${params.toString()}`;
    router.replace(`/executions${newUrl}`, { scroll: false });
  };

  const handleIsArchivedChange = (value: string) => {
    setIsArchivedFilter(value);
    const urlLimit = parseInt(searchParams.get('limit') || '50', 10);
    const urlInstanceId = searchParams.get('instanceId');
    const urlWorkflowId = searchParams.get('workflowId');
    const urlStatus = searchParams.get('status');
    const urlFinished = searchParams.get('finished');
    const urlHasErrors = searchParams.get('hasErrors');
    
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', urlLimit.toString());
    if (urlInstanceId) params.set('instanceId', urlInstanceId);
    if (urlWorkflowId) params.set('workflowId', urlWorkflowId);
    if (urlStatus) params.set('status', urlStatus);
    if (urlFinished) params.set('finished', urlFinished);
    if (urlHasErrors) params.set('hasErrors', urlHasErrors);
    if (value && value !== 'all') {
      params.set('isArchived', value);
    }

    const newUrl = `?${params.toString()}`;
    router.replace(`/executions${newUrl}`, { scroll: false });
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 px-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Executions</h1>
            <p className="text-muted-foreground">
              Page {page} of {totalPages} • Total: {total} executions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              <IconActivity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
              <p className="text-xs text-muted-foreground">
                {totalPages} pages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <IconCircleCheckFilled className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <p className="text-xs text-muted-foreground">
                {total > 0 ? ((successCount / total) * 100).toFixed(1) : 0}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <IconCircleXFilled className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <p className="text-xs text-muted-foreground">
                {total > 0 ? ((errorCount / total) * 100).toFixed(1) : 0}% failure rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
              <IconClock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{runningCount}</div>
              <p className="text-xs text-muted-foreground">
                Currently executing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Executions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Executions List</CardTitle>
            <CardDescription>
              List of all workflow executions with filtering and sorting capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 py-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="instanceId" className="text-sm font-medium whitespace-nowrap">
                  Instance ID:
                </Label>
                <Input
                  id="instanceId"
                  type="text"
                  placeholder="Filter by instance ID"
                  value={instanceIdInput}
                  onChange={(e) => handleInstanceIdChange(e.target.value)}
                  className="w-32"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="workflowId" className="text-sm font-medium whitespace-nowrap">
                  Workflow ID:
                </Label>
                <Input
                  id="workflowId"
                  type="text"
                  placeholder="Filter by workflow ID"
                  value={workflowIdInput}
                  onChange={(e) => handleWorkflowIdChange(e.target.value)}
                  className="w-32"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="status" className="text-sm font-medium whitespace-nowrap">
                  Status:
                </Label>
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger id="status" className="w-40">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="finished" className="text-sm font-medium whitespace-nowrap">
                  Finished:
                </Label>
                <Select value={finishedFilter} onValueChange={handleFinishedChange}>
                  <SelectTrigger id="finished" className="w-32">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="hasErrors" className="text-sm font-medium whitespace-nowrap">
                  Has Errors:
                </Label>
                <Select value={hasErrorsFilter} onValueChange={handleHasErrorsChange}>
                  <SelectTrigger id="hasErrors" className="w-32">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="isArchived" className="text-sm font-medium whitespace-nowrap">
                  Archived:
                </Label>
                <Select value={isArchivedFilter} onValueChange={handleIsArchivedChange}>
                  <SelectTrigger id="isArchived" className="w-32">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-4">{error}</p>
                <button 
                  onClick={() => fetchExecutions(page, limit, filters)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Retry
                </button>
              </div>
            ) : (
              <ExecutionsDataTable 
                data={executions} 
                isLoading={isLoading}
                onFiltersChange={handleFiltersChange}
                total={total}
                page={page}
                limit={limit}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
