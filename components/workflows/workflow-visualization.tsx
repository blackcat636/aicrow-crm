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
  IconMaximize,
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

// Helper function to format parameter values
const formatParameterValue = (value: any): string => {
  if (value === null || value === undefined) {
    return 'null';
  }
  
  if (typeof value === 'string') {
    return value.length > 40 ? `${value.substring(0, 40)}...` : value;
  }
  
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  if (typeof value === 'number') {
    return String(value);
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (value.length <= 2) {
      return `[${value.map(item => formatParameterValue(item)).join(', ')}]`;
    }
    return `[${value.slice(0, 2).map(item => formatParameterValue(item)).join(', ')}, +${value.length - 2} more]`;
  }
  
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return '{}';
    }
    if (keys.length === 1) {
      return `{${keys[0]}: ${formatParameterValue(value[keys[0]])}}`;
    }
    if (keys.length <= 3) {
      return `{${keys.map(key => `${key}: ${formatParameterValue(value[key])}`).join(', ')}}`;
    }
    return `{${keys.slice(0, 2).map(key => `${key}: ${formatParameterValue(value[key])}`).join(', ')}, +${keys.length - 2} more}`;
  }
  
  return String(value);
};

// Map node types to colors
const getNodeColor = (type: string) => {
  if (type.includes('trigger')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (type.includes('httpRequest')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  if (type.includes('telegram')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  if (type.includes('supabase')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
  if (type.includes('if')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  if (type.includes('wait')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  if (type.includes('stickyNote')) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};

export function WorkflowVisualization({ nodes, connections, compact = false, zoom = 1, pan = { x: 0, y: 0 } }: WorkflowVisualizationProps) {
  // Debug logging
  console.log('🔍 WorkflowVisualization Debug Info:');
  console.log('📊 Nodes data:', nodes);
  console.log('🔗 Connections data:', connections);
  console.log('⚙️ Props:', { compact, zoom, pan });
  
  if (nodes && Array.isArray(nodes)) {
    console.log('📈 Nodes count:', nodes.length);
    console.log('📍 First node example:', nodes[0]);
    
    // Log node types distribution
    const nodeTypes = nodes.reduce((acc, node) => {
      const type = node.type.split('.').pop() || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('🏷️ Node types distribution:', nodeTypes);
    
    // Log parameters info
    nodes.forEach((node, index) => {
      if (index < 3) { // Log first 3 nodes in detail
        console.log(`🔧 Node ${index + 1} (${node.name}):`, {
          type: node.type,
          position: node.position,
          parameters: node.parameters,
          credentials: node.credentials,
          parametersCount: node.parameters ? Object.keys(node.parameters).length : 0,
          credentialsCount: node.credentials ? Object.keys(node.credentials).length : 0
        });
      }
    });
  }
  
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
    
    console.log('📐 Canvas dimensions calculation:', {
      minX, maxX, minY, maxY,
      scaleFactor,
      padding,
      originalWidth: maxX - minX,
      originalHeight: maxY - minY,
      calculatedWidth: dimensions.width,
      calculatedHeight: dimensions.height
    });
    
    return dimensions;
  }, [nodes]);

  // Calculate offset to center nodes in canvas with scaled positions
  const nodeOffset = useMemo(() => {
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) return { x: 0, y: 0 };
    
    const minX = Math.min(...nodes.map(node => node.position[0]));
    const minY = Math.min(...nodes.map(node => node.position[1]));
    const scaleFactor = 1.5;
    
    const offset = {
      x: Math.max(0, 100 - minX * scaleFactor), // Center with scaled positions
      y: Math.max(0, 100 - minY * scaleFactor)   // Center with scaled positions
    };
    
    console.log('📍 Node offset calculation:', {
      minX, minY,
      scaleFactor,
      calculatedOffsetX: offset.x,
      calculatedOffsetY: offset.y
    });
    
    return offset;
  }, [nodes]);

  // Render connections between nodes
  const renderConnections = () => {
    if (!connections) {
      console.log('🔗 No connections data available');
      return null;
    }

    console.log('🔗 Processing connections:', connections);
    const connectionLines: React.ReactElement[] = [];
    
    Object.entries(connections).forEach(([sourceNodeName, connectionData]) => {
      const sourceNode = nodes.find(node => node.name === sourceNodeName);
      if (!sourceNode || !connectionData?.main) return;

      connectionData.main.forEach((outputConnections, outputIndex) => {
        if (!outputConnections || !Array.isArray(outputConnections)) return;
        
        outputConnections.forEach(connection => {
          if (!connection?.node) return;
          
          const targetNode = nodes.find(node => node.name === connection.node);
          if (!targetNode) return;

          const sourceX = ((sourceNode.position[0] * 1.5) + nodeOffset.x) + 150; // Node width / 2
          const sourceY = ((sourceNode.position[1] * 1.5) + nodeOffset.y) + 25; // Node height / 2
          const targetX = ((targetNode.position[0] * 1.5) + nodeOffset.x) + 150;
          const targetY = ((targetNode.position[1] * 1.5) + nodeOffset.y) + 25;

          connectionLines.push(
            <line
              key={`${sourceNodeName}-${connection.node}-${outputIndex}`}
              x1={sourceX}
              y1={sourceY}
              x2={targetX}
              y2={targetY}
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground"
              markerEnd="url(#arrowhead)"
            />
          );
        });
      });
    });

    return connectionLines;
  };

  // Compact version - just show a button to open modal
  if (compact) {
    console.log('📱 Rendering compact version');
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    
    // Zoom functions
    const handleZoomIn = () => {
      setZoom(prev => Math.min(prev * 1.2, 3));
    };

    const handleZoomOut = () => {
      setZoom(prev => Math.max(prev / 1.2, 0.3));
    };

    const handleResetZoom = () => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconEye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Workflow Structure</span>
            <Badge variant="outline" className="text-xs">
              {nodes.length} nodes
            </Badge>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <IconMaximize className="h-4 w-4 mr-2" />
                View
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] overflow-hidden">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle>Workflow Structure</DialogTitle>
                    <DialogDescription>
                      Full visual representation of workflow nodes and their connections
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleZoomOut}>
                      <IconZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[3rem] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button variant="outline" size="sm" onClick={handleZoomIn}>
                      <IconZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleResetZoom}>
                      <IconRotateClockwise className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-auto">
                <WorkflowVisualization nodes={nodes} connections={connections} compact={false} zoom={zoom} pan={pan} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  console.log('🖥️ Rendering full version');
  return (
    <div className="w-full overflow-auto">
      <div 
        className="relative bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20"
        style={{ 
          width: canvasDimensions.width, 
          height: canvasDimensions.height,
          minHeight: '300px'
        }}
      >
        {/* SVG for connections */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <g transform={`translate(${pan.x * zoom}, ${pan.y * zoom}) scale(${zoom})`}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="currentColor"
                  className="text-muted-foreground"
                />
              </marker>
            </defs>
            {renderConnections()}
          </g>
        </svg>

        {/* Render nodes */}
        {nodes && Array.isArray(nodes) && nodes.map((node) => {
          const IconComponent = getNodeIcon(node.type);
          const colorClass = getNodeColor(node.type);
          
          // Log node rendering info
          console.log(`🎨 Rendering node: ${node.name}`, {
            type: node.type,
            position: node.position,
            scaledPosition: {
              x: (node.position[0] * 1.5) + nodeOffset.x + pan.x,
              y: (node.position[1] * 1.5) + nodeOffset.y + pan.y
            },
            parametersCount: node.parameters ? Object.keys(node.parameters).length : 0,
            credentialsCount: node.credentials ? Object.keys(node.credentials).length : 0,
            colorClass,
            iconComponent: IconComponent.name
          });
          
          return (
            <div
              key={node.id}
              className="absolute"
              style={{
                left: ((node.position[0] * 1.5) + nodeOffset.x + pan.x) * zoom,
                top: ((node.position[1] * 1.5) + nodeOffset.y + pan.y) * zoom,
                zIndex: 2,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left'
              }}
            >
              <Card className="w-72 shadow-md hover:shadow-lg transition-shadow border">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-md ${colorClass}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate" title={node.name}>
                        {node.name}
                      </h4>
                      <Badge variant="outline" className="text-xs mt-1">
                        {node.type.split('.').pop()}
                      </Badge>
                      
                      {/* Show additional node info */}
                      <div className="mt-1 space-y-1">
                        {/* Node ID */}
                        <div className="text-xs text-muted-foreground">
                          ID: {node.id.slice(0, 8)}...
                        </div>
                        
                        {/* Type version */}
                        {node.typeVersion && (
                          <div className="text-xs text-muted-foreground">
                            Version: {node.typeVersion}
                          </div>
                        )}
                        
                        {/* Disabled status */}
                        {node.disabled && (
                          <Badge variant="destructive" className="text-xs">
                            Disabled
                          </Badge>
                        )}
                        
                        {/* Webhook info */}
                        {node.webhookId && (
                          <div className="text-xs text-muted-foreground">
                            Webhook: {node.webhookId.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                      
                      {/* Show key parameters */}
                      {node.parameters && Object.keys(node.parameters).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(node.parameters).slice(0, 2).map(([key, value]) => (
                            <div key={key} className="text-xs text-muted-foreground">
                              <span className="font-medium">{key}:</span>{' '}
                              <span className="truncate">
                                {formatParameterValue(value)}
                              </span>
                            </div>
                          ))}
                          {Object.keys(node.parameters).length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{Object.keys(node.parameters).length - 2} more parameters
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show credentials if available */}
                      {node.credentials && Object.keys(node.credentials).length > 0 && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {Object.keys(node.credentials).length} credential(s)
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}

        {/* Empty state */}
        {(!nodes || !Array.isArray(nodes) || nodes.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <IconSettings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No nodes available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
