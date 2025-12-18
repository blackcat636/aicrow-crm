"use client"
export const runtime = 'edge';
import { useEffect, useState, useRef, useCallback } from 'react';
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
import { IconSearch } from "@tabler/icons-react"
import { WorkflowFilters } from '@/lib/api/workflows'

const sanitizeNumericId = (value?: string | null) => {
  if (!value) {
    return '';
  }

  return value.replace(/\D/g, '');
};

export default function Page() { 
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workflows, isLoading, error, total, page, limit, fetchWorkflows } = useWorkflowsStore()
  
  // Local state for filter inputs
  const [workflowIdInput, setWorkflowIdInput] = useState<string>('');
  const [n8nIdInput, setN8nIdInput] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [availableToUsersFilter, setAvailableToUsersFilter] = useState<string>('all');
  const [showFilter, setShowFilter] = useState<string>('true');
  
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
        
        // Preserve existing filter params
        const urlWorkflowId = searchParams.get('workflowId');
        const urlN8nId = searchParams.get('n8nId');
        const urlSearch = searchParams.get('search');
        const urlActive = searchParams.get('active');
        const urlAvailableToUsers = searchParams.get('availableToUsers');
        const urlShow = searchParams.get('show');
        
        if (urlWorkflowId) params.set('workflowId', urlWorkflowId);
        if (urlN8nId) params.set('n8nId', urlN8nId);
        if (urlSearch) params.set('search', urlSearch);
        if (urlActive) params.set('active', urlActive);
        if (urlAvailableToUsers) params.set('availableToUsers', urlAvailableToUsers);
        // Always preserve show parameter, default to 'true' if not present
        params.set('show', urlShow || 'true');
        
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
      return;
    }

    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlLimit = parseInt(searchParams.get('limit') || '20', 10);
    const rawWorkflowId = searchParams.get('workflowId');
    const sanitizedWorkflowId = sanitizeNumericId(rawWorkflowId);
    const urlN8nId = searchParams.get('n8nId') || '';

    // If workflowId in URL містить нецифрові символи — виправляємо URL й не робимо запит з некоректним значенням
    if (rawWorkflowId !== null && sanitizedWorkflowId !== rawWorkflowId) {
      const params = new URLSearchParams(searchParams.toString());

      if (sanitizedWorkflowId) {
        params.set('workflowId', sanitizedWorkflowId);
      } else {
        params.delete('workflowId');
      }

      router.replace(`/workflows?${params.toString()}`, { scroll: false });
      return;
    }

    const urlSearch = searchParams.get('search') || '';
    const urlActive = searchParams.get('active') || 'all';
    const urlAvailableToUsers = searchParams.get('availableToUsers') || 'all';
    // Get show from URL, default to 'true' if not present
    const urlShow = searchParams.get('show') || 'true';
    
    // Update local state from URL
    setWorkflowIdInput(sanitizedWorkflowId);
    setN8nIdInput(urlN8nId);
    setSearchInput(urlSearch);
    setActiveFilter(urlActive);
    setAvailableToUsersFilter(urlAvailableToUsers);
    setShowFilter(urlShow);
    
    // Build filters object
    // Explicitly set undefined to clear filters when empty or "all" is selected
    // Use workflowId as id parameter for exact match, search for text search
    const filters: WorkflowFilters = {
      page: urlPage,
      limit: urlLimit,
      id: sanitizedWorkflowId ? parseInt(sanitizedWorkflowId, 10) : undefined,
      n8nId: urlN8nId || undefined,
      search: urlSearch || undefined,
      // Explicitly set undefined when "all" to clear the filter in store
      active: urlActive !== 'all' ? (urlActive === 'true') : undefined,
      availableToUsers: urlAvailableToUsers !== 'all' ? (urlAvailableToUsers === 'true') : undefined,
      // Pass show as string: 'true', 'false', or 'all'
      show: urlShow,
    };

    // Create URL string for comparison
    const currentUrl = `page=${urlPage}&limit=${urlLimit}&workflowId=${sanitizedWorkflowId || ''}&n8nId=${urlN8nId}&search=${urlSearch}&active=${urlActive}&availableToUsers=${urlAvailableToUsers}&show=${urlShow}`;
    
    // Only fetch if URL actually changed
    if (previousUrlRef.current !== currentUrl) {
      previousUrlRef.current = currentUrl;
      fetchWorkflows(filters);
    }
  }, [searchParams, fetchWorkflows, router]);

  const updateFilters = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', '1'); // Reset to page 1 when filtering
    params.set('limit', limit.toString());

    const sanitizedWorkflowId = sanitizeNumericId(workflowIdInput.trim());
    const trimmedN8nId = n8nIdInput.trim();
    const trimmedSearch = searchInput.trim();
    
    if (sanitizedWorkflowId) params.set('workflowId', sanitizedWorkflowId);
    if (trimmedN8nId) params.set('n8nId', trimmedN8nId);
    if (trimmedSearch) params.set('search', trimmedSearch);
    if (activeFilter !== 'all') params.set('active', activeFilter);
    if (availableToUsersFilter !== 'all') params.set('availableToUsers', availableToUsersFilter);
    // Always set show parameter to preserve user selection
    params.set('show', showFilter);

    // Don't update previousUrlRef here - let useEffect handle it after URL change
    router.replace(`/workflows?${params.toString()}`, { scroll: false });
  }, [workflowIdInput, n8nIdInput, searchInput, activeFilter, availableToUsersFilter, showFilter, limit, router]);

  // Debounced search for text inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters();
    }, 500);

    return () => clearTimeout(timer);
  }, [workflowIdInput, n8nIdInput, searchInput, updateFilters]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    params.set('limit', limit.toString());

    const sanitizedWorkflowId = sanitizeNumericId(workflowIdInput.trim());
    if (sanitizedWorkflowId) params.set('workflowId', sanitizedWorkflowId);
    if (n8nIdInput.trim()) params.set('n8nId', n8nIdInput.trim());
    if (searchInput.trim()) params.set('search', searchInput.trim());
    if (activeFilter !== 'all') params.set('active', activeFilter);
    if (availableToUsersFilter !== 'all') params.set('availableToUsers', availableToUsersFilter);
    params.set('show', showFilter);

    router.replace(`/workflows?${params.toString()}`, { scroll: false });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', newPageSize.toString());

    const sanitizedWorkflowId = sanitizeNumericId(workflowIdInput.trim());
    if (sanitizedWorkflowId) params.set('workflowId', sanitizedWorkflowId);
    if (n8nIdInput.trim()) params.set('n8nId', n8nIdInput.trim());
    if (searchInput.trim()) params.set('search', searchInput.trim());
    if (activeFilter !== 'all') params.set('active', activeFilter);
    if (availableToUsersFilter !== 'all') params.set('availableToUsers', availableToUsersFilter);
    params.set('show', showFilter);

    router.replace(`/workflows?${params.toString()}`, { scroll: false });
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
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 py-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="workflowId" className="text-sm font-medium whitespace-nowrap">
              Workflow ID:
            </Label>
            <Input
              id="workflowId"
              type="text"
              placeholder="Workflow ID"
              value={workflowIdInput}
              onChange={(e) => setWorkflowIdInput(sanitizeNumericId(e.target.value))}
              onBlur={updateFilters}
              className="w-32"
              inputMode="numeric"
              pattern="\\d*"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="n8nId" className="text-sm font-medium whitespace-nowrap">
              n8n ID:
            </Label>
            <Input
              id="n8nId"
              type="text"
              placeholder="n8n ID"
              value={n8nIdInput}
              onChange={(e) => setN8nIdInput(e.target.value)}
              onBlur={updateFilters}
              className="w-32"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="search" className="text-sm font-medium whitespace-nowrap">
              Search:
            </Label>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                placeholder="Name, Description, id"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="active" className="text-sm font-medium whitespace-nowrap">
              Active:
            </Label>
            <Select value={activeFilter} onValueChange={(value) => { setActiveFilter(value); updateFilters(); }}>
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
          
          <div className="flex items-center gap-2">
            <Label htmlFor="availableToUsers" className="text-sm font-medium whitespace-nowrap">
              Available to Users:
            </Label>
            <Select value={availableToUsersFilter} onValueChange={(value) => { setAvailableToUsersFilter(value); updateFilters(); }}>
              <SelectTrigger id="availableToUsers" className="w-40">
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
            <Label htmlFor="show" className="text-sm font-medium whitespace-nowrap">
              Show:
            </Label>
            <Select value={showFilter} onValueChange={(value) => { setShowFilter(value); updateFilters(); }}>
              <SelectTrigger id="show" className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
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
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
