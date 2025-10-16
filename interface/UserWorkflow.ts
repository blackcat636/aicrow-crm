export interface UserWorkflow {
  id: number;
  userId: number;
  workflowId: number;
  instanceId: number;
  name?: string; // Backend will add this field in the future
  instanceName?: string; // Backend will add this field in the future
  description: string | null;
  isActive: boolean;
  scheduleType: 'manual' | 'cron' | 'interval' | null;
  scheduleConfig: Record<string, any> | null;
  lastExecutedAt: string | null;
  nextExecutionAt: string | null;
  totalExecutions?: number; // Backend will add this field in the future
  successfulExecutions?: number; // Backend will add this field in the future
  failedExecutions?: number; // Backend will add this field in the future
  createdAt: string;
  updatedAt: string;

  // Relations
  user?: {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };

  workflow?: {
    id: number;
    name: string;
    n8nId: string;
    active: boolean;
  };

  instance?: {
    id: number;
    name: string;
    apiUrl: string;
  };
}

export interface UserWorkflowsApiResponse {
  status: number;
  data: {
    items: UserWorkflow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export interface UserWorkflowApiResponse {
  status: number;
  data: UserWorkflow;
  message?: string;
}

export interface CreateUserWorkflowDto {
  workflowId: number;
  instanceId?: number; // Optional for now
  name?: string; // Optional for now, will be required when backend adds support
  description?: string;
  isActive?: boolean;
  scheduleType?: 'manual' | 'cron' | 'interval';
  scheduleConfig?: Record<string, any>;
}

export interface UpdateUserWorkflowDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  scheduleType?: 'manual' | 'cron' | 'interval' | null;
  scheduleConfig?: Record<string, any> | null;
}

export interface ToggleUserWorkflowResponse {
  status: number;
  data: {
    id: number;
    isActive: boolean;
  };
  message?: string;
}
