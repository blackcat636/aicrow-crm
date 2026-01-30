export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  period: 'monthly' | 'yearly' | 'one_time';
  trialDays: number;
  tokensIncluded: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeature {
  id: number;
  planId: number;
  featureKey: string; // 'automations', 'content_factory'
  isEnabled: boolean;
  featureValue?: {
    limit?: number;
    resetPeriod?: string;
  };
}

export interface SubscriptionPlansApiResponse {
  status: number;
  message: string;
  data: SubscriptionPlan[];
  total: number;
  page: number;
  limit: number;
}

export interface SubscriptionPlanApiResponse {
  status: number;
  message: string;
  data: SubscriptionPlan;
}

export interface PlanFeaturesApiResponse {
  status: number;
  message: string;
  data: PlanFeature[];
}

export interface CreatePlanRequest {
  name: string;
  description?: string | null;
  price: number;
  period: 'monthly' | 'yearly' | 'one_time';
  trialDays?: number;
  tokensIncluded: number;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string | null;
  price?: number;
  period?: 'monthly' | 'yearly' | 'one_time';
  trialDays?: number;
  tokensIncluded?: number;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface PlanFeatureRequest {
  featureKey: string;
  isEnabled: boolean;
  featureValue?: {
    limit?: number;
    resetPeriod?: string;
  };
}

export interface UpdatePlanFeaturesRequest {
  features: PlanFeatureRequest[];
}

/** Body for POST /admin/subscription-plans/:id/features (add single feature) */
export interface AddPlanFeatureRequest {
  featureType: string;
  featureKey: string;
  featureValue?: Record<string, unknown>;
}
