import type { TranslatableApiValue } from '@/lib/translatable';

/** API may return a plain string (default locale) or per-locale map. */
export type PlanTranslatableField = Exclude<
  TranslatableApiValue,
  null | undefined
>;

export interface SubscriptionPlan {
  id: number;
  name: PlanTranslatableField;
  description: PlanTranslatableField | null;
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
  name: string | Record<string, string>;
  description?: string | Record<string, string> | null;
  price: number;
  period: 'monthly' | 'yearly' | 'one_time';
  trialDays?: number;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface UpdatePlanRequest {
  name?: string | Record<string, string>;
  description?: string | Record<string, string> | null;
  price?: number;
  period?: 'monthly' | 'yearly' | 'one_time';
  trialDays?: number;
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
