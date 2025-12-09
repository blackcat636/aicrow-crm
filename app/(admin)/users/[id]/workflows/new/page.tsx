"use client"

export const runtime = 'edge';

import { use, useEffect, useState } from 'react';
import { useRouter } from "next/navigation"
import { useUserWorkflowsStore } from "@/store/useUserWorkflowsStore"
import { useWorkflowsStore } from "@/store/useWorkflowsStore"
import { getWorkflowById, getSocialNetworks, SocialNetwork } from "@/lib/api/workflows"
import { Workflow } from "@/interface/Workflow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react"
import { toast } from "sonner"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CreateUserWorkflowPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const userId = parseInt(resolvedParams.id);
  const router = useRouter();
  
  const { createWorkflow } = useUserWorkflowsStore()
  const { workflows, fetchWorkflows } = useWorkflowsStore()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workflowId: '',
    isActive: true,
    scheduleType: 'manual' as 'manual' | 'cron' | 'interval',
  })
  
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([])
  const [selectedSocialNetworks, setSelectedSocialNetworks] = useState<string[]>([])
  const [isLoadingSocialNetworks, setIsLoadingSocialNetworks] = useState(false)

  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  // Load workflow details and social networks when workflow is selected
  useEffect(() => {
    const loadWorkflowDetails = async () => {
      if (!formData.workflowId) {
        setSelectedWorkflow(null)
        setSelectedSocialNetworks([])
        return
      }

      try {
        const workflowId = parseInt(formData.workflowId)
        const workflow = workflows.find(w => w.id === workflowId)
        
        if (workflow) {
          // Fetch full workflow details
          const response = await getWorkflowById(workflowId)
          if (response.status === 200 && response.data) {
            setSelectedWorkflow(response.data)
            // Initialize with empty selection
            setSelectedSocialNetworks([])
          } else {
            setSelectedWorkflow(workflow)
          }
        }

        // Load available social networks
        setIsLoadingSocialNetworks(true)
        const socialNetworksResponse = await getSocialNetworks()
        if (socialNetworksResponse.status === 200 || socialNetworksResponse.status === 0) {
          const networks = socialNetworksResponse.data || []
          setSocialNetworks(networks)
        }
      } catch (error) {
        console.error('Error loading workflow details:', error)
      } finally {
        setIsLoadingSocialNetworks(false)
      }
    }

    loadWorkflowDetails()
  }, [formData.workflowId, workflows])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!formData.workflowId) {
      toast.error('Please select a workflow')
      setIsSubmitting(false)
      return
    }

    try {
      const result = await createWorkflow(userId, {
        workflowId: parseInt(formData.workflowId),
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        scheduleType: formData.scheduleType,
      })

      if (result) {
        toast.success('Workflow created successfully')
        router.push(`/user-workflows?userId=${userId}`)
      } else {
        toast.error('Failed to create workflow')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating workflow'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <IconArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create User Workflow</h1>
            <p className="text-muted-foreground">
              Configure a new workflow for this user
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Workflow Configuration</CardTitle>
              <CardDescription>
                Fill in the details to create a new user workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter workflow name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter workflow description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                  <Label htmlFor="workflowId">Workflow *</Label>
                  <Select
                    value={formData.workflowId}
                    onValueChange={(value) => setFormData({ ...formData, workflowId: value })}
                    required
                  >
                    <SelectTrigger id="workflowId">
                      <SelectValue placeholder="Select a workflow" />
                    </SelectTrigger>
                    <SelectContent>
                      {workflows.map((workflow) => (
                        <SelectItem key={workflow.id} value={workflow.id.toString()}>
                          {workflow.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduleType">Schedule Type</Label>
                  <Select
                    value={formData.scheduleType}
                    onValueChange={(value) => setFormData({ ...formData, scheduleType: value as 'manual' | 'cron' | 'interval' })}
                  >
                    <SelectTrigger id="scheduleType">
                      <SelectValue placeholder="Select schedule type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="cron">Cron</SelectItem>
                      <SelectItem value="interval">Interval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pb-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              {/* Social Networks Selection */}
              {selectedWorkflow && selectedWorkflow.allowedSocialNetworks && selectedWorkflow.allowedSocialNetworks.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Social Networks</Label>
                      <p className="text-xs text-muted-foreground">
                        Select social networks for this workflow
                      </p>
                      {isLoadingSocialNetworks ? (
                        <p className="text-sm text-muted-foreground">Loading social networks...</p>
                      ) : (
                        <Card>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {socialNetworks
                                .filter(network => selectedWorkflow.allowedSocialNetworks?.includes(network.value))
                                .map((network) => {
                                  const isSelected = selectedSocialNetworks.includes(network.value)
                                  
                                  return (
                                    <div key={network.value} className="flex items-center space-x-2 py-2">
                                      <Switch
                                        id={`social-${network.value}`}
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setSelectedSocialNetworks([...selectedSocialNetworks, network.value])
                                          } else {
                                            setSelectedSocialNetworks(selectedSocialNetworks.filter(v => v !== network.value))
                                          }
                                        }}
                                      />
                                      <Label
                                        htmlFor={`social-${network.value}`}
                                        className="text-sm font-normal cursor-pointer"
                                      >
                                        {network.label}
                                      </Label>
                                    </div>
                                  )
                                })}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      {selectedSocialNetworks.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {selectedSocialNetworks.length} network{selectedSocialNetworks.length !== 1 ? 's' : ''} selected
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  <IconDeviceFloppy className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Creating...' : 'Create Workflow'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}

