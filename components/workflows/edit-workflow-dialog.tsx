"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { updateWorkflow } from '@/lib/api/workflows';
import { Workflow } from '@/interface/Workflow';
import { IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import { toast } from 'sonner';

interface EditWorkflowDialogProps {
  workflow: Workflow;
  onWorkflowUpdated: (updatedWorkflow: Workflow) => void;
}

export function EditWorkflowDialog({ workflow, onWorkflowUpdated }: EditWorkflowDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: workflow.displayName || '',
    displayDescription: workflow.displayDescription || '',
    availableToUsers: workflow.availableToUsers || false,
    priceUsd: Math.floor(workflow.priceUsd || 0),
    show: workflow.show === 1 || workflow.show === true || (typeof workflow.show === 'string' && (workflow.show === 'true' || workflow.show === '1')),
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      // Initialize form data from workflow prop
      setFormData({
        displayName: workflow.displayName || '',
        displayDescription: workflow.displayDescription || '',
        availableToUsers: workflow.availableToUsers || false,
        priceUsd: Math.floor(workflow.priceUsd || 0),
        show: workflow.show === 1 || workflow.show === true || (typeof workflow.show === 'string' && (workflow.show === 'true' || workflow.show === '1')),
      });
    }
  }, [open, workflow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateWorkflow(workflow.id, formData);
      
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
      show: workflow.show === 1 || workflow.show === true || (typeof workflow.show === 'string' && (workflow.show === 'true' || workflow.show === '1')),
    });
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

            <div className="flex items-center justify-between">
              <Label htmlFor="show">Show</Label>
              <Switch
                id="show"
                checked={formData.show}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show: checked }))}
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
