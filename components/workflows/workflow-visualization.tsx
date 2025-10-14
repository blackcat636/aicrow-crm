"use client"

import React, { useMemo, useState } from 'react';
import { WorkflowNode, WorkflowConnections } from '@/interface/Workflow';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  IconPlayerPlay, 
  IconWorld, 
  IconSend, 
  IconNote, 
  IconDatabase, 
  IconQuestionMark, 
  IconClock,
  IconSettings,
  IconEye,
  IconZoomIn,
  IconZoomOut,
  IconRotateClockwise
} from '@tabler/icons-react';

interface WorkflowVisualizationProps {
  nodes: WorkflowNode[];
  connections?: WorkflowConnections;
  compact?: boolean;
  zoom?: number;
  pan?: { x: number; y: number };
}

// Map node types to icons
const getNodeIcon = (type: string) => {
  if (type.includes('trigger')) return IconPlayerPlay;
  if (type.includes('httpRequest')) return IconWorld;
  if (type.includes('telegram')) return IconSend;
  if (type.includes('supabase')) return IconDatabase;
  if (type.includes('if')) return IconQuestionMark;
  if (type.includes('wait')) return IconClock;
  if (type.includes('stickyNote')) return IconNote;
  return IconSettings;
};

// Helper function to format parameter values - removed as unused

export function WorkflowVisualization({ nodes, connections, compact = false, zoom = 1, pan = { x: 0, y: 0 } }: WorkflowVisualizationProps) {
  const [zoomState, setZoomState] = useState(zoom);
  const [panState, setPanState] = useState(pan);
  
  // Calculate canvas dimensions based on node positions with compact spacing
  const canvasDimensions = useMemo(() => {
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) return { width: 800, height: 500 };
    
    const minX = Math.min(...nodes.map(node => node.position[0]));
    const maxX = Math.max(...nodes.map(node => node.position[0]));
    const minY = Math.min(...nodes.map(node => node.position[1]));
    const maxY = Math.max(...nodes.map(node => node.position[1]));
    
    // Scale up the positions to create more spacing
    const scaleFactor = 1.5; // Reduced spacing for better fit
    const padding = 150;
    
    const dimensions = {
      width: Math.max(800, (maxX - minX) * scaleFactor + padding * 2),
      height: Math.max(500, (maxY - minY) * scaleFactor + padding * 2)
    };
    
    return dimensions;
  }, [nodes]);

  // Calculate offset to center nodes in canvas with scaled positions
  const canvasOffset = useMemo(() => {
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) return { x: 0, y: 0 };
    
    const minX = Math.min(...nodes.map(node => node.position[0]));
    const minY = Math.min(...nodes.map(node => node.position[1]));
    const scaleFactor = 1.5;
    const padding = 150;
    
    return {
      x: padding - minX * scaleFactor,
      y: padding - minY * scaleFactor
    };
  }, [nodes]);

  // Create connection lines
  const connectionLines = useMemo(() => {
    if (!connections || !Array.isArray(connections)) return [];
    
    return connections.map((connection, index) => {
      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);
      
      if (!sourceNode || !targetNode) return null;
      
      const scaleFactor = 1.5;
      const sourceX = sourceNode.position[0] * scaleFactor + canvasOffset.x;
      const sourceY = sourceNode.position[1] * scaleFactor + canvasOffset.y;
      const targetX = targetNode.position[0] * scaleFactor + canvasOffset.x;
      const targetY = targetNode.position[1] * scaleFactor + canvasOffset.y;
      
      return (
        <svg
          key={index}
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `scale(${zoomState})`,
            transformOrigin: 'top left'
          }}
        >
          <line
            x1={sourceX}
            y1={sourceY}
            x2={targetX}
            y2={targetY}
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="text-muted-foreground"
          />
        </svg>
      );
    }).filter(Boolean);
  }, [connections, nodes, canvasOffset, zoomState]);

  // Zoom functions
  const handleZoomIn = () => {
    setZoomState(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomState(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleResetZoom = () => {
    setZoomState(1);
    setPanState({ x: 0, y: 0 });
  };

  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No workflow nodes available for visualization
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create node elements
  const nodeElements = nodes.map((node, index) => {
    const IconComponent = getNodeIcon(node.type);
    const scaleFactor = 1.5;
    const scaledX = node.position[0] * scaleFactor + canvasOffset.x;
    const scaledY = node.position[1] * scaleFactor + canvasOffset.y;
    
    return (
      <div
        key={node.id}
        className="absolute transform -translate-x-1/2 -translate-y-1/2"
        style={{
          left: scaledX,
          top: scaledY,
          transform: `translate(-50%, -50%) scale(${zoomState})`,
          transformOrigin: 'center'
        }}
      >
        <Card className="w-48 h-24 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary/20">
          <CardContent className="p-3 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <IconComponent className="h-4 w-4 text-primary" />
              <Badge variant="outline" className="text-xs">
                {node.type.split('.').pop() || 'Unknown'}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {node.name || `Node ${index + 1}`}
            </div>
            {node.parameters && Object.keys(node.parameters).length > 0 && (
              <div className="text-xs text-muted-foreground">
                {Object.keys(node.parameters).length} params
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  });

  // Compact version - just show a button to open modal
  if (compact) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <IconEye className="h-4 w-4 mr-2" />
            View Workflow
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Workflow Visualization</DialogTitle>
            <DialogDescription>
              Interactive workflow diagram with {nodes.length} nodes
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <IconZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <IconZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetZoom}>
                <IconRotateClockwise className="h-4 w-4" />
              </Button>
              <div className="text-sm text-muted-foreground ml-4">
                Zoom: {Math.round(zoomState * 100)}%
              </div>
            </div>
            <div 
              className="relative border rounded-lg overflow-hidden bg-muted/20"
              style={{ 
                width: canvasDimensions.width, 
                height: canvasDimensions.height,
                transform: `translate(${panState.x}px, ${panState.y}px)`
              }}
            >
              {connectionLines}
              {nodeElements}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Full version
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Workflow Visualization</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <IconZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <IconZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetZoom}>
              <IconRotateClockwise className="h-4 w-4" />
            </Button>
            <div className="text-sm text-muted-foreground ml-4">
              Zoom: {Math.round(zoomState * 100)}%
            </div>
          </div>
        </div>
        
        <div 
          className="relative border rounded-lg overflow-hidden bg-muted/20"
          style={{ 
            width: canvasDimensions.width, 
            height: canvasDimensions.height,
            transform: `translate(${panState.x}px, ${panState.y}px)`
          }}
        >
          {connectionLines}
          {nodeElements}
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          {nodes.length} nodes • {Array.isArray(connections) ? connections.length : 0} connections
        </div>
      </CardContent>
    </Card>
  );
}