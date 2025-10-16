"use client"

export const runtime = 'edge';

import { use, useEffect } from 'react';
import { UserWorkflowsDataTable } from "@/components/user-workflows/user-workflows-data-table"
import { useUserWorkflowsStore } from "@/store/useUserWorkflowsStore"
import { Button } from "@/components/ui/button"
import { IconPlus, IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function UserWorkflowsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const userId = parseInt(resolvedParams.id);
  const router = useRouter();
  
  const { 
    userWorkflows, 
    isLoading, 
    error, 
    total, 
    page, 
    limit, 
    fetchUserWorkflows 
  } = useUserWorkflowsStore()

  useEffect(() => {
    if (userId) {
      fetchUserWorkflows(userId);
    }
  }, [userId, fetchUserWorkflows]);

  const handlePageChange = (newPage: number) => {
    fetchUserWorkflows(userId, newPage, limit);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    fetchUserWorkflows(userId, 1, newPageSize);
  };

  const handleFiltersChange = () => {
    // Intentionally left blank: parent handles fetching via effects and store
  };

  if (isLoading && userWorkflows.length === 0) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <IconArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">User Workflows</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">
              Page {page} of {Math.ceil(total / limit)} • Total: {total} workflows
            </p>
          </div>
          <Button asChild>
            <Link href={`/users/${userId}/workflows/new`}>
              <IconPlus className="mr-2 h-4 w-4" />
              Create Workflow
            </Link>
          </Button>
        </div>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <UserWorkflowsDataTable 
            data={userWorkflows} 
            total={total}
            page={page}
            limit={limit}
            userId={userId}
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

