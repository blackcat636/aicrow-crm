"use client"

export const runtime = 'edge';

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getInstanceById } from '@/lib/api/instances'
import { Instance } from '@/interface/Instance'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  IconArrowLeft, 
  IconCalendar, 
  IconCircleCheckFilled, 
  IconCircleXFilled, 
  IconServer, 
  IconSettings, 
  IconActivity,
  IconExternalLink,
  IconClock,
  IconAlertTriangle
} from '@tabler/icons-react'
import Link from 'next/link'

export default function InstanceDetailPage() {
  const params = useParams()
  const instanceId = parseInt(params.id as string)
  
  const [instance, setInstance] = useState<Instance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInstance = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await getInstanceById(instanceId)
        
        if (response.status === 200 && response.data) {
          setInstance(response.data)
        } else {
          setError(response.message || 'Failed to load instance')
        }
      } catch (err) {
        console.error('Error fetching instance:', err)
        setError('Failed to load instance')
      } finally {
        setIsLoading(false)
      }
    }

    if (instanceId) {
      fetchInstance()
    }
  }, [instanceId])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading instance...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !instance) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'Instance not found'}</p>
            <Button variant="outline">
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to list
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 px-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{instance.name}</h1>
            <p className="text-muted-foreground">
              n8n Instance Configuration
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={instance.apiUrl} target="_blank" rel="noopener noreferrer">
                <IconExternalLink className="h-4 w-4 mr-2" />
                Open in n8n
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/instances">
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Back to list
              </Link>
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconServer className="h-4 w-4" />
              Instance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {instance.isActive ? (
                  <IconCircleCheckFilled className="h-5 w-5 text-green-500" />
                ) : (
                  <IconCircleXFilled className="h-5 w-5 text-red-500" />
                )}
                <Badge variant={instance.isActive ? "default" : "secondary"}>
                  {instance.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {instance.isDefault && (
                <Badge variant="outline">Default Instance</Badge>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconClock className="h-4 w-4" />
                Last sync: {new Date(instance.lastSyncAt).toLocaleString('uk-UA')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {instance.lastError && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <IconAlertTriangle className="h-4 w-4" />
                Last Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive">{instance.lastError}</p>
              {instance.lastErrorAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Error occurred: {new Date(instance.lastErrorAt).toLocaleString('uk-UA')}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instance Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconSettings className="h-4 w-4" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">API URL</p>
                  <p className="text-muted-foreground font-mono">{instance.apiUrl}</p>
                </div>
                <div>
                  <p className="font-medium">Version</p>
                  <p className="text-muted-foreground">{instance.version || 'Unknown'}</p>
                </div>
                <div>
                  <p className="font-medium">Sync Interval</p>
                  <p className="text-muted-foreground">{instance.syncInterval} minutes</p>
                </div>
                <div>
                  <p className="font-medium">Description</p>
                  <p className="text-muted-foreground">{instance.description || 'No description'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sync Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconActivity className="h-4 w-4" />
                Sync Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sync Projects</span>
                  <Badge variant={instance.syncProjects ? "default" : "secondary"}>
                    {instance.syncProjects ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sync Workflows</span>
                  <Badge variant={instance.syncWorkflows ? "default" : "secondary"}>
                    {instance.syncWorkflows ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sync Executions</span>
                  <Badge variant={instance.syncExecutions ? "default" : "secondary"}>
                    {instance.syncExecutions ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <IconSettings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{instance.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                Projects in this instance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
              <IconSettings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{instance.totalWorkflows}</div>
              <p className="text-xs text-muted-foreground">
                Workflows in this instance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              <IconActivity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{instance.totalExecutions}</div>
              <p className="text-xs text-muted-foreground">
                Executions in this instance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCalendar className="h-4 w-4" />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Created At</p>
                <p className="text-muted-foreground">
                  {new Date(instance.createdAt).toLocaleString('uk-UA')}
                </p>
              </div>
              <div>
                <p className="font-medium">Updated At</p>
                <p className="text-muted-foreground">
                  {new Date(instance.updatedAt).toLocaleString('uk-UA')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
