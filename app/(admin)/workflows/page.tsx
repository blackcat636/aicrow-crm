"use client"
export const runtime = 'edge';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WorkflowsDataTable } from "@/components/workflows/workflows-data-table"
import { useWorkflowsStore } from "@/store/useWorkflowsStore"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Page() { 
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workflows, isLoading, error, total, page, limit, instanceId, active, fetchWorkflows } = useWorkflowsStore()
  const [instanceIdInput, setInstanceIdInput] = useState<string>(instanceId?.toString() || '');
  const [activeFilter, setActiveFilter] = useState<string>(active !== undefined ? active.toString() : 'all');
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
        params.set('limit', urlLimit || '20');
        const urlInstanceId = searchParams.get('instanceId');
        const urlActive = searchParams.get('active');
        if (urlInstanceId) params.set('instanceId', urlInstanceId);
        if (urlActive) params.set('active', urlActive);
        
        const newUrl = `?${params.toString()}`;
        router.replace(`/workflows${newUrl}`, { scroll: false });
        isInitializedRef.current = true;
        return;
      }
      isInitializedRef.current = true;
    }
  }, [searchParams, router]);

  // Sync URL → Store: Fetch data when URL changes
  useEffect(() => {
    if (!isInitializedRef.current) {
      return; // Wait for initialization
    }

    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlLimit = parseInt(searchParams.get('limit') || '20', 10);
    const urlInstanceId = searchParams.get('instanceId');
    const urlActive = searchParams.get('active');
    
    // Use null to explicitly clear filter when not in URL (store will convert to undefined for API)
    const parsedInstanceId = urlInstanceId ? parseInt(urlInstanceId, 10) : null;
    // Parse active: if present in URL, convert to boolean (true/false), otherwise null (clear filter)
    const parsedActive = urlActive !== null ? (urlActive === 'true' ? true : false) : null;
    
    // Update local state from URL
    if (parsedInstanceId !== null && parsedInstanceId.toString() !== instanceIdInput) {
      setInstanceIdInput(parsedInstanceId.toString());
    } else if (parsedInstanceId === null && instanceIdInput !== '') {
      setInstanceIdInput('');
    }
    
    // Update activeFilter from URL
    if (parsedActive !== null) {
      // parsedActive is boolean (true or false), convert to string for Select component
      const newActiveFilter = parsedActive.toString();
      if (newActiveFilter !== activeFilter) {
        setActiveFilter(newActiveFilter);
      }
    } else if (parsedActive === null && activeFilter !== 'all') {
      setActiveFilter('all');
    }
    
    // Create URL string for comparison
    const currentUrl = `page=${urlPage}&limit=${urlLimit}&instanceId=${parsedInstanceId ?? ''}&active=${parsedActive ?? ''}`;
    
    // Only fetch if URL actually changed
    if (previousUrlRef.current !== currentUrl) {
      previousUrlRef.current = currentUrl;
      
      // Debug logging
      console.log('🔍 Fetching workflows with params:', {
        page: urlPage,
        limit: urlLimit,
        instanceId: parsedInstanceId,
        active: parsedActive,
        urlActive: urlActive
      });
      
      // Fetch data from URL params
      // Pass null to explicitly clear filters (store will convert to undefined for API)
      fetchWorkflows(urlPage, urlLimit, parsedInstanceId, parsedActive);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, fetchWorkflows]); // Include fetchWorkflows to ensure it's available

  const handlePageChange = (newPage: number) => {
    const urlLimit = parseInt(searchParams.get('limit') || '20', 10);
    const urlInstanceId = searchParams.get('instanceId');
    const urlActive = searchParams.get('active');
    
    // Update previousUrlRef immediately to prevent duplicate fetches
    // Use null to explicitly clear filters when not in URL
    const parsedInstanceId = urlInstanceId ? parseInt(urlInstanceId, 10) : null;
    const parsedActive = urlActive !== null ? (urlActive === 'true' ? true : false) : null;
    const newUrlString = `page=${newPage}&limit=${urlLimit}&instanceId=${parsedInstanceId ?? ''}&active=${parsedActive ?? ''}`;
    previousUrlRef.current = newUrlString;
    
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    params.set('limit', urlLimit.toString());
    if (urlInstanceId) params.set('instanceId', urlInstanceId);
    if (urlActive) params.set('active', urlActive);

    const newUrl = `?${params.toString()}`;
    router.replace(`/workflows${newUrl}`, { scroll: false });
    
    // Fetch immediately to update data
    // Pass null to explicitly clear filters (store will convert to undefined for API)
    fetchWorkflows(newPage, urlLimit, parsedInstanceId, parsedActive);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const urlInstanceId = searchParams.get('instanceId');
    const urlActive = searchParams.get('active');
    
    // Update previousUrlRef immediately to prevent duplicate fetches
    // Use null to explicitly clear filters when not in URL
    const parsedInstanceId = urlInstanceId ? parseInt(urlInstanceId, 10) : null;
    const parsedActive = urlActive !== null ? (urlActive === 'true' ? true : false) : null;
    const newUrlString = `page=1&limit=${newPageSize}&instanceId=${parsedInstanceId ?? ''}&active=${parsedActive ?? ''}`;
    previousUrlRef.current = newUrlString;
    
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', newPageSize.toString());
    if (urlInstanceId) params.set('instanceId', urlInstanceId);
    if (urlActive) params.set('active', urlActive);

    const newUrl = `?${params.toString()}`;
    router.replace(`/workflows${newUrl}`, { scroll: false });
    
    // Fetch immediately to update data
    // Pass null to explicitly clear filters (store will convert to undefined for API)
    fetchWorkflows(1, newPageSize, parsedInstanceId, parsedActive);
  };

  const handleInstanceIdChange = (value: string) => {
    setInstanceIdInput(value);
    const urlLimit = parseInt(searchParams.get('limit') || '20', 10);
    const urlActive = searchParams.get('active');
    
    const params = new URLSearchParams();
    params.set('page', '1'); // Reset to page 1 when filtering
    params.set('limit', urlLimit.toString());
    if (value) {
      const instanceIdNum = parseInt(value, 10);
      if (!isNaN(instanceIdNum)) {
        params.set('instanceId', instanceIdNum.toString());
      }
    }
    if (urlActive) params.set('active', urlActive);

    // Update previousUrlRef immediately to prevent duplicate fetches
    // Use null to explicitly clear the filter when empty
    const parsedInstanceId = value ? parseInt(value, 10) : null;
    const parsedActive = urlActive !== null ? (urlActive === 'true' ? true : false) : null;
    const newUrlString = `page=1&limit=${urlLimit}&instanceId=${parsedInstanceId ?? ''}&active=${parsedActive ?? ''}`;
    previousUrlRef.current = newUrlString;

    const newUrl = `?${params.toString()}`;
    router.replace(`/workflows${newUrl}`, { scroll: false });
    
    // Fetch immediately to update data
    // Pass null to explicitly clear the filter (store will convert to undefined for API)
    fetchWorkflows(1, urlLimit, parsedInstanceId, parsedActive);
  };

  const handleActiveChange = (value: string) => {
    setActiveFilter(value);
    const urlLimit = parseInt(searchParams.get('limit') || '20', 10);
    const urlInstanceId = searchParams.get('instanceId');
    
    const params = new URLSearchParams();
    params.set('page', '1'); // Reset to page 1 when filtering
    params.set('limit', urlLimit.toString());
    if (urlInstanceId) params.set('instanceId', urlInstanceId);
    if (value && value !== 'all') {
      params.set('active', value);
    }

    // Update previousUrlRef immediately to prevent duplicate fetches
    const parsedInstanceId = urlInstanceId ? parseInt(urlInstanceId, 10) : null;
    // Use null to explicitly clear the filter when "all" is selected
    const parsedActive = value && value !== 'all' ? value === 'true' : null;
    const newUrlString = `page=1&limit=${urlLimit}&instanceId=${parsedInstanceId ?? ''}&active=${parsedActive ?? ''}`;
    previousUrlRef.current = newUrlString;

    const newUrl = `?${params.toString()}`;
    router.replace(`/workflows${newUrl}`, { scroll: false });
    
    // Fetch immediately to update data
    // Pass null to explicitly clear the filter (store will convert to undefined for API)
    fetchWorkflows(1, urlLimit, parsedInstanceId, parsedActive);
  };

  const handleFiltersChange = () => {
    // Handled by individual filter handlers
  };

  if (isLoading && workflows.length === 0) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 px-6 pb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Workflows</h1>
                <p className="text-sm text-muted-foreground">
                  Page {page} of {Math.ceil(total / limit)} • Total: {total} workflows
                </p>
              </div>  
            </div>
            <div className="flex items-center gap-4 py-4">
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
                <Label htmlFor="active" className="text-sm font-medium whitespace-nowrap">
                  Active:
                </Label>
                <Select value={activeFilter} onValueChange={handleActiveChange}>
                  <SelectTrigger id="active" className="w-32">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <WorkflowsDataTable 
                data={workflows} 
                total={total}
                page={page}
                limit={limit}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onFiltersChange={handleFiltersChange}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
  )
}
