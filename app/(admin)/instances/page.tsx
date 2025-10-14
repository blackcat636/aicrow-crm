"use client"

export const runtime = 'edge';

import { useEffect } from 'react'
import { useInstancesStore } from '@/store/useInstancesStore'
import { InstancesDataTable } from '@/components/instances/instances-data-table'
import { CreateInstanceDialog } from '@/components/instances/create-instance-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconServer, IconCircleCheckFilled, IconCircleXFilled } from '@tabler/icons-react'

export default function InstancesPage() {
  const { 
    instances, 
    isLoading, 
    error, 
    fetchInstances
  } = useInstancesStore()

  useEffect(() => {
    fetchInstances()
  }, [fetchInstances])

  const activeCount = instances.filter(i => i.isActive).length
  const totalWorkflows = instances.reduce((sum, i) => sum + i.totalWorkflows, 0)
  const totalExecutions = instances.reduce((sum, i) => sum + i.totalExecutions, 0)

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Instances</h1>
            <p className="text-muted-foreground">
              Manage n8n instances and their configurations
            </p>
          </div>
          <CreateInstanceDialog />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Instances</CardTitle>
              <IconServer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{instances.length}</div>
              <p className="text-xs text-muted-foreground">
                n8n instances configured
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <IconCircleCheckFilled className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
              <p className="text-xs text-muted-foreground">
                {instances.length > 0 ? ((activeCount / instances.length) * 100).toFixed(1) : 0}% active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
              <IconCircleCheckFilled className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalWorkflows}</div>
              <p className="text-xs text-muted-foreground">
                Across all instances
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              <IconCircleXFilled className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalExecutions}</div>
              <p className="text-xs text-muted-foreground">
                Across all instances
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Instances Table */}
        <Card>
          <CardHeader>
            <CardTitle>Instances List</CardTitle>
            <CardDescription>
              List of all n8n instances with their configurations and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-4">{error}</p>
                <Button 
                  onClick={() => fetchInstances()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Retry
                </Button>
              </div>
            ) : (
              <InstancesDataTable 
                data={instances} 
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
