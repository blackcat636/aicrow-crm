"use client";

import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Workflow } from '@/interface/Workflow';

interface WorkflowMultiSelectProps {
  workflows: Workflow[];
  selectedIds: number[];
  currentWorkflowId: number;
  onChange: (selectedIds: number[]) => void;
}

export function WorkflowMultiSelect({
  workflows,
  selectedIds,
  currentWorkflowId,
  onChange
}: WorkflowMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter out current workflow and apply search filter
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      // Exclude current workflow
      if (workflow.id === currentWorkflowId) {
        return false;
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const name = (workflow.displayName || workflow.name || '').toLowerCase();
        const id = workflow.id.toString();
        return name.includes(query) || id.includes(query);
      }

      return true;
    });
  }, [workflows, currentWorkflowId, searchQuery]);

  const handleToggle = (workflowId: number, checked: boolean) => {
    if (checked) {
      onChange([...selectedIds, workflowId]);
    } else {
      onChange(selectedIds.filter(id => id !== workflowId));
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <Label>Search workflows</Label>
        <Input
          type="text"
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="max-h-64 overflow-y-auto space-y-3">
            {filteredWorkflows.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {searchQuery.trim() ? 'No workflows found matching your search' : 'No workflows available'}
              </p>
            ) : (
              filteredWorkflows.map(workflow => (
                <div key={workflow.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`workflow-${workflow.id}`}
                    checked={selectedIds.includes(workflow.id)}
                    onCheckedChange={(checked) => handleToggle(workflow.id, checked as boolean)}
                  />
                  <Label
                    htmlFor={`workflow-${workflow.id}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    <span className="font-medium">
                      {workflow.displayName || workflow.name}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      (ID: {workflow.id})
                    </span>
                  </Label>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedIds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedIds.length} workflow{selectedIds.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}

