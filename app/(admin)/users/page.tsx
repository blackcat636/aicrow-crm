"use client"
export const runtime = 'edge';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable } from "@/components/users/data-table"
import { useUsersStore } from "@/store/useUsersStore"
import { Input } from "@/components/ui/input"
import { IconSearch } from "@tabler/icons-react"
import { CreateUserDialog } from "@/components/users/create-user-dialog"

export default function Page() { 
  const router = useRouter();
  const searchParams = useSearchParams();
  const { users, isLoading, error, total, page, limit, fetchUsers, search, setSearch } = useUsersStore()
  const [searchQuery, setSearchQuery] = useState(search || '');

  // Initial load and URL sync - fetch data on mount and when URL changes
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlLimit = parseInt(searchParams.get('limit') || '10', 10);
    const urlSearch = searchParams.get('search') || '';

    // Fetch if URL params differ from store, or if users array is empty (initial load)
    if (urlPage !== page || urlLimit !== limit || urlSearch !== search || users.length === 0) {
      fetchUsers(urlPage, urlLimit, urlSearch);
    }
  }, [searchParams, page, limit, search, users.length, fetchUsers]); // Run when URL params change

  // Update URL when page/limit/search changes (but not from URL read)
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlLimit = parseInt(searchParams.get('limit') || '10', 10);
    const urlSearch = searchParams.get('search') || '';

    // Only update URL if store values differ from URL (to avoid loops)
    if (page !== urlPage || limit !== urlLimit || search !== urlSearch) {
      const params = new URLSearchParams();
      if (page > 1) params.set('page', page.toString());
      if (limit !== 10) params.set('limit', limit.toString());
      if (search) params.set('search', search);

      const newUrl = params.toString() ? `?${params.toString()}` : '';
      router.replace(`/users${newUrl}`, { scroll: false });
    }
  }, [page, limit, search, router, searchParams]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== search) {
        setSearch(searchQuery);
        fetchUsers(1, limit, searchQuery); // Reset to page 1 when searching
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, limit, fetchUsers, setSearch, search]);

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, limit, searchQuery);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    fetchUsers(1, newPageSize, searchQuery); // Return to first page when changing size
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
