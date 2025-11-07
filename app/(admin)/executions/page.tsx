"use client"

export const runtime = 'edge';

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useExecutionsStore } from '@/store/useExecutionsStore'
import { ExecutionsDataTable } from '@/components/executions/executions-data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconActivity, IconClock, IconCircleCheckFilled, IconCircleXFilled, IconArrowLeft } from '@tabler/icons-react'

export default function ExecutionsPage() {
  const searchParams = useSearchParams()
  const workflowId = searchParams.get('workflowId')
  
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

  const [currentFilters, setCurrentFilters] = useState(filters)

  useEffect(() => {
    // Apply workflow filter only when URL param changes to avoid loops
    if (workflowId) {
      if (filters.workflowId !== workflowId) {
        const newFilters = { ...filters, workflowId }
        setCurrentFilters(newFilters)
        setFilters(newFilters)
      } else {
        setCurrentFilters(filters)
      }
    } else {
      setCurrentFilters(filters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId])

  useEffect(() => {
    // Keep local filters in sync with store changes (without re-applying setFilters)
    setCurrentFilters(filters)
  }, [filters])

  useEffect(() => {
    // Load data with default limit of 10
    fetchExecutions(1, 10, currentFilters)
  }, [fetchExecutions, currentFilters])

  const successCount = executions.filter(e => e.status === 'success').length
  const errorCount = executions.filter(e => e.status === 'error').length
  const runningCount = executions.filter(e => e.status === 'running').length

  const handleFiltersChange = () => {
    // Intentionally left blank: parent handles fetching via effects and store
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 px-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Executions</h1>
            <p className="text-muted-foreground">
              {workflowId ? `Executions for workflow ${workflowId}` : 'View workflow executions'}
            </p>
          </div>
          {workflowId && (
            <Button variant="outline" asChild>
              <Link href="/workflows">
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Back to Workflows
              </Link>
            </Button>
          )}
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
                onPageChange={(newPage) => fetchExecutions(newPage, limit, currentFilters)}
                onPageSizeChange={(newLimit) => fetchExecutions(1, newLimit, currentFilters)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
