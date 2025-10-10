"use client"
export const runtime = 'edge';
import { useEffect } from 'react';
import { DataTable } from "@/components/users/data-table"
import { useUsersStore } from "@/store/useUsersStore"

export default function Page() { 
  const { users, isLoading, error, total, page, limit, fetchUsers } = useUsersStore()

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, limit);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    fetchUsers(1, newPageSize); // Return to first page when changing size
  };

  if (isLoading && users.length === 0) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Users</h1>
                <p className="text-sm text-muted-foreground">
                  Page {page} of {Math.ceil(total / limit)} • Total: {total} users
                </p>
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
