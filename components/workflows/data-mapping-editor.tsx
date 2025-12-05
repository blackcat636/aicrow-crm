"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface DataMappingEditorProps {
  value: Record<string, string>;
  onChange: (mapping: Record<string, string>) => void;
}

interface MappingRow {
  id: string;
  key: string;
  value: string;
}

export function DataMappingEditor({ value, onChange }: DataMappingEditorProps) {
  const [mappings, setMappings] = useState<MappingRow[]>([]);
  const isInternalUpdate = useRef(false);

  // Initialize mappings from value prop
  useEffect(() => {
    // Skip if this is an internal update
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const rows = Object.entries(value).map(([key, val], index) => ({
      id: `mapping-${index}-${key}`,
      key,
      value: val
    }));
    setMappings(rows);
  }, [value]);

  // Update parent when mappings change
  useEffect(() => {
    const mappingObj = mappings.reduce((acc, item) => {
      if (item.key.trim()) {
        acc[item.key.trim()] = item.value;
      }
      return acc;
    }, {} as Record<string, string>);

    // Only call onChange if the mapping actually changed
    const currentMappingStr = JSON.stringify(mappingObj);
    const valueStr = JSON.stringify(value);
    if (currentMappingStr !== valueStr) {
      isInternalUpdate.current = true;
      onChange(mappingObj);
    }
  }, [mappings, value, onChange]);

  const addMapping = () => {
    const newId = `mapping-${Date.now()}`;
    setMappings([...mappings, { id: newId, key: '', value: '' }]);
  };

  const updateMapping = (id: string, field: 'key' | 'value', newValue: string) => {
    setMappings(mappings.map(item => 
      item.id === id ? { ...item, [field]: newValue } : item
    ));
  };

  const removeMapping = (id: string) => {
    setMappings(mappings.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {mappings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-md">
            No mappings defined. Click &quot;Add Mapping&quot; to create one.
          </p>
        ) : (
          <div className="space-y-3">
            {mappings.map((mapping) => (
              <div key={mapping.id} className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor={`key-${mapping.id}`} className="text-xs">
                      Target Field Name
                    </Label>
                    <Input
                      id={`key-${mapping.id}`}
                      type="text"
                      placeholder="e.g., prompt, imageUrl"
                      value={mapping.key}
                      onChange={(e) => updateMapping(mapping.id, 'key', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`value-${mapping.id}`} className="text-xs">
                      Data Path (Template)
                    </Label>
                    <Input
                      id={`value-${mapping.id}`}
                      type="text"
                      placeholder="e.g., {{resultData.data.text}}"
                      value={mapping.value}
                      onChange={(e) => updateMapping(mapping.id, 'value', e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeMapping(mapping.id)}
                  className="mt-6"
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addMapping}
        className="w-full"
      >
        <IconPlus className="h-4 w-4 mr-2" />
        Add Mapping
      </Button>

      {/* Help text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-medium">Template Syntax:</p>
        <p>Use <code className="bg-muted px-1 py-0.5 rounded">{"{{resultData.path.to.data}}"}</code> to reference data from the execution result.</p>
        <p>Example: <code className="bg-muted px-1 py-0.5 rounded">{"{{resultData.data.text}}"}</code> or <code className="bg-muted px-1 py-0.5 rounded">{"{{resultData.output.message}}"}</code></p>
      </div>

      {/* Preview */}
      {Object.keys(value).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <Label className="text-xs font-medium mb-2 block">Preview:</Label>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

