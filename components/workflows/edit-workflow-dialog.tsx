"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { updateWorkflow, getAllWorkflows } from '@/lib/api/workflows';
import { Workflow, ChainableWorkflowsConfig } from '@/interface/Workflow';
import { IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import { toast } from 'sonner';
import { WorkflowMultiSelect } from './workflow-multi-select';
import { DataMappingEditor } from './data-mapping-editor';

interface EditWorkflowDialogProps {
  workflow: Workflow;
  onWorkflowUpdated: (updatedWorkflow: Workflow) => void;
}

export function EditWorkflowDialog({ workflow, onWorkflowUpdated }: EditWorkflowDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableWorkflows, setAvailableWorkflows] = useState<Workflow[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [formData, setFormData] = useState({
    displayName: workflow.displayName || '',
    displayDescription: workflow.displayDescription || '',
    availableToUsers: workflow.availableToUsers || false,
    priceUsd: Math.floor(workflow.priceUsd || 0),
  });
  const [chainableWorkflows, setChainableWorkflows] = useState<ChainableWorkflowsConfig | null>(
    workflow.chainableWorkflows || null
  );

  // Load available workflows and reset form when dialog opens
  useEffect(() => {
    if (open) {
      fetchAvailableWorkflows();
      // Initialize form data from workflow prop
      setFormData({
        displayName: workflow.displayName || '',
        displayDescription: workflow.displayDescription || '',
        availableToUsers: workflow.availableToUsers || false,
        priceUsd: Math.floor(workflow.priceUsd || 0),
      });
      // Initialize chainableWorkflows from workflow prop
      setChainableWorkflows(workflow.chainableWorkflows || null);
    }
  }, [open, workflow]);

  const fetchAvailableWorkflows = async () => {
    setIsLoadingWorkflows(true);
    try {
      const response = await getAllWorkflows({ 
        limit: 100,
        active: true 
      });
      if (response.status === 200 || response.status === 0) {
        setAvailableWorkflows(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData = {
        ...formData,
        chainableWorkflows: chainableWorkflows
      };
      
      const result = await updateWorkflow(workflow.id, updateData);
      
      if (result.status === 200) {
        toast.success('Workflow updated successfully!');
        onWorkflowUpdated(result.data);
        setOpen(false);
      } else {
        toast.error(result.message || 'Failed to update workflow');
      }
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast.error('Error updating workflow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      displayName: workflow.displayName || '',
      displayDescription: workflow.displayDescription || '',
      availableToUsers: workflow.availableToUsers || false,
      priceUsd: Math.floor(workflow.priceUsd || 0),
    });
    setChainableWorkflows(workflow.chainableWorkflows || null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconEdit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Workflow</DialogTitle>
          <DialogDescription>
            Update information for workflow &quot;{workflow.name}&quot;
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Enter display name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="displayDescription">Description</Label>
              <Textarea
                id="displayDescription"
                value={formData.displayDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, displayDescription: e.target.value }))}
                placeholder="Enter workflow description"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="availableToUsers">Available to Users</Label>
              <Switch
                id="availableToUsers"
                checked={formData.availableToUsers}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, availableToUsers: checked }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priceUsd">Price (Token)</Label>
              <Input
                id="priceUsd"
                type="number"
                step="1"
                min="0"
                value={formData.priceUsd}
                onChange={(e) => setFormData(prev => ({ ...prev, priceUsd: Math.floor(parseInt(e.target.value) || 0) }))}
                placeholder="0"
              />
            </div>

            <Separator />

            {/* Chainable Workflows Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableChainableWorkflows"
                    checked={chainableWorkflows !== null}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setChainableWorkflows({
                          allowedTargets: [],
                          defaultDataMapping: {}
                        });
                      } else {
                        setChainableWorkflows(null);
                      }
                    }}
                  />
                  <Label htmlFor="enableChainableWorkflows" className="text-base font-medium cursor-pointer">
                    Configure workflow chains
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  If enabled, restricts which workflows can receive results from this workflow.
                  If disabled, users can chain to any attached workflow.
                </p>
              </div>

              {chainableWorkflows !== null && (
                <div className="space-y-4 ml-6 border-l-2 pl-4">
                  {/* Allowed Target Workflows */}
                  <div className="space-y-2">
                    <Label>Allowed target workflows</Label>
                    {isLoadingWorkflows ? (
                      <p className="text-sm text-muted-foreground">Loading workflows...</p>
                    ) : (
                      <WorkflowMultiSelect
                        workflows={availableWorkflows}
                        selectedIds={chainableWorkflows.allowedTargets || []}
                        currentWorkflowId={workflow.id}
                        onChange={(selectedIds) => {
                          setChainableWorkflows({
                            ...chainableWorkflows,
                            allowedTargets: selectedIds
                          });
                        }}
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      Users can only chain to workflows from this list (if they have attached them).
                    </p>
                  </div>

                  {/* Default Data Mapping */}
                  <div className="space-y-2">
                    <Label>Default Data Mapping (Optional)</Label>
                    <p className="text-xs text-muted-foreground">
                      Define how result data should be transformed when chaining.
                      Use template syntax: {"{{resultData.path.to.data}}"}
                    </p>
                    <DataMappingEditor
                      value={chainableWorkflows.defaultDataMapping || {}}
                      onChange={(mapping) => {
                        setChainableWorkflows({
                          ...chainableWorkflows,
                          defaultDataMapping: mapping
                        });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              <IconX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <IconCheck className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
