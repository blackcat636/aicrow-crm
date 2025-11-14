"use client"
export const runtime = 'edge';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable } from "@/components/users/data-table"
import { useUsersStore } from "@/store/useUsersStore"
import { Input } from "@/components/ui/input"
import { IconSearch } from "@tabler/icons-react"
import { CreateUserDialog } from "@/components/users/create-user-dialog"

export default function Page() { 
  const router = useRouter();
  const searchParams = useSearchParams();
  const { users, isLoading, error, total, page, limit, fetchUsers, search } = useUsersStore()
  const [searchQuery, setSearchQuery] = useState(search || '');
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
        params.set('limit', urlLimit || '10');
        const urlSearch = searchParams.get('search');
        if (urlSearch) params.set('search', urlSearch);
        
        const newUrl = `?${params.toString()}`;
        router.replace(`/users${newUrl}`, { scroll: false });
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
    const urlLimit = parseInt(searchParams.get('limit') || '10', 10);
    const urlSearch = searchParams.get('search') || '';
    
    // Create URL string for comparison
    const currentUrl = `page=${urlPage}&limit=${urlLimit}&search=${urlSearch}`;
    
    // Only fetch if URL actually changed
    if (previousUrlRef.current !== currentUrl) {
      previousUrlRef.current = currentUrl;
      
      // Update local search query from URL
      if (urlSearch !== searchQuery) {
        setSearchQuery(urlSearch);
      }

      // Fetch data from URL params
      fetchUsers(urlPage, urlLimit, urlSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only react to URL changes - intentionally not including other deps to avoid loops

  // Debounced search - update URL when search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const urlSearch = searchParams.get('search') || '';
      if (searchQuery === urlSearch) {
        return; // No change needed
      }

      const urlLimit = parseInt(searchParams.get('limit') || '10', 10);
      
      const params = new URLSearchParams();
      params.set('page', '1'); // Reset to page 1 when searching
      params.set('limit', urlLimit.toString()); // Always include limit
      if (searchQuery) params.set('search', searchQuery);

      const newUrl = `?${params.toString()}`;
      router.replace(`/users${newUrl}`, { scroll: false });
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, router, searchParams]);

  const handlePageChange = (newPage: number) => {
    const urlLimit = parseInt(searchParams.get('limit') || '10', 10);
    const urlSearch = searchParams.get('search') || '';
    
    // Update previousUrlRef immediately to prevent duplicate fetches
    const newUrlString = `page=${newPage}&limit=${urlLimit}&search=${urlSearch}`;
    previousUrlRef.current = newUrlString;
    
    const params = new URLSearchParams();
    params.set('page', newPage.toString()); // Always include page
    params.set('limit', urlLimit.toString()); // Always include limit
    if (urlSearch) params.set('search', urlSearch);

    const newUrl = `?${params.toString()}`;
    router.replace(`/users${newUrl}`, { scroll: false });
    
    // Fetch immediately to update data
    fetchUsers(newPage, urlLimit, urlSearch);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const urlSearch = searchParams.get('search') || '';
    
    // Update previousUrlRef immediately to prevent duplicate fetches
    const newUrlString = `page=1&limit=${newPageSize}&search=${urlSearch}`;
    previousUrlRef.current = newUrlString;
    
    const params = new URLSearchParams();
    params.set('page', '1'); // Reset to page 1 when changing size
    params.set('limit', newPageSize.toString()); // Always include limit
    if (urlSearch) params.set('search', urlSearch);

    const newUrl = `?${params.toString()}`;
    router.replace(`/users${newUrl}`, { scroll: false });
    
    // Fetch immediately to update data
    fetchUsers(1, newPageSize, urlSearch);
  };


  if (isLoading && users.length === 0) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 px-6 pb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Users</h1>
                <p className="text-sm text-muted-foreground">
                  Page {page} of {Math.ceil(total / limit)} • Total: {total} users
                </p>
              </div>
              <div>
                <CreateUserDialog />
              </div>
            </div>
            <div className="flex items-center gap-4 py-4">
              <div className="relative flex-1 max-w-sm">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, username, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DataTable 
                data={users} 
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
