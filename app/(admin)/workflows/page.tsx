"use client"
export const runtime = 'edge';
import { useEffect } from 'react';
import { WorkflowsDataTable } from "@/components/workflows/workflows-data-table"
import { useWorkflowsStore } from "@/store/useWorkflowsStore"

export default function Page() { 
  const { workflows, isLoading, error, total, page, limit, fetchWorkflows } = useWorkflowsStore()

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handlePageChange = (newPage: number) => {
    fetchWorkflows(newPage, limit);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    fetchWorkflows(1, newPageSize); // Return to first page when changing size
  };

  const handleFiltersChange = (filters: any[]) => {
    // TODO: Implement server-side filtering
    console.log('Filters changed:', filters);
  };

  if (isLoading && workflows.length === 0) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Workflows</h1>
                <p className="text-sm text-muted-foreground">
                  Page {page} of {Math.ceil(total / limit)} • Total: {total} workflows
                </p>
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
