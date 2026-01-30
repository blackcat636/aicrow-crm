import {
  SubscriptionPlansApiResponse,
  SubscriptionPlanApiResponse,
  PlanFeaturesApiResponse,
  CreatePlanRequest,
  UpdatePlanRequest,
  UpdatePlanFeaturesRequest,
  AddPlanFeatureRequest
} from '@/interface/SubscriptionPlan';
import { fetchWithAuth } from '../api';

export interface SubscriptionPlanFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export async function getAllPlans(
  filters: SubscriptionPlanFilters = {}
): Promise<SubscriptionPlansApiResponse> {
  const { page = 1, limit = 10, isActive } = filters;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  if (isActive !== undefined) {
    params.append('isActive', isActive.toString());
  }

  // Use Next.js API route instead of direct backend call
  const url = `/api/admin/subscription-plans?${params}`;

  try {
    const response = await fetchWithAuth(url);
    const rawData = await response.json();

    if (!response.ok) {
      return {
        status: response.status,
        message: rawData.message || 'Failed to fetch subscription plans',
        data: [],
        total: 0,
        page: 0,
        limit: 0
      };
    }

    // Handle both response formats:
    // Format 1: { status: 200, data: [...], total, page, limit }
    // Format 2: { status: 200, data: { items: [...], total, page, limit } }
    let data: SubscriptionPlansApiResponse;

    if (rawData.data && Array.isArray(rawData.data.items)) {
      // Format 2: nested structure
      data = {
        status: rawData.status || 200,
        message: rawData.message || 'Subscription plans retrieved successfully',
        data: rawData.data.items,
        total: rawData.data.total ?? 0,
        page: rawData.data.page ?? page,
        limit: rawData.data.limit ?? limit
      };
    } else if (Array.isArray(rawData.data)) {
      // Format 1: flat structure with data array
      data = {
        status: rawData.status || 200,
        message: rawData.message || 'Subscription plans retrieved successfully',
        data: rawData.data,
        total: rawData.total ?? 0,
        page: rawData.page ?? page,
        limit: rawData.limit ?? limit
      };
    } else {
      // Fallback: try to use rawData as is
      data = {
        status: rawData.status || 200,
        message: rawData.message || 'Subscription plans retrieved successfully',
        data: Array.isArray(rawData.data) ? rawData.data : [],
        total: rawData.total ?? 0,
        page: rawData.page ?? page,
        limit: rawData.limit ?? limit
      };
    }

    // Check if successful status (200 or 0)
    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      return {
        status: data.status || 500,
        message: data.message || 'Failed to fetch subscription plans',
        data: [],
        total: 0,
        page: 0,
        limit: 0
      };
    }
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return {
      status: 0,
      message: error instanceof Error ? error.message : 'Network error',
      data: [],
      total: 0,
      page: 0,
      limit: 0
    };
  }
}

export async function getPlanById(
  id: number
): Promise<SubscriptionPlanApiResponse> {
  try {
    const response = await fetchWithAuth(`/api/admin/subscription-plans/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch subscription plan with id ${id}`);
    }
    const data = (await response.json()) as SubscriptionPlanApiResponse;

    // Check if successful status (200 or 0)
    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(
        data.message || `Failed to fetch subscription plan with id ${id}`
      );
    }
  } catch (error) {
    console.error('Error fetching subscription plan by id:', error);
    return {
      status: 0,
      message: 'Network error',
      data: {
        id: 0,
        name: '',
        description: null,
        price: 0,
        period: 'monthly',
        trialDays: 0,
        tokensIncluded: 0,
        isActive: false,
        isDefault: false,
        createdAt: '',
        updatedAt: ''
      }
    };
  }
}

// Create new subscription plan
export async function createPlan(
  planData: CreatePlanRequest
): Promise<SubscriptionPlanApiResponse> {
  try {
    const url = `/api/admin/subscription-plans`;
    const requestBody = JSON.stringify(planData);

    const response = await fetchWithAuth(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: requestBody
    });

    let data: SubscriptionPlanApiResponse;
    try {
      const responseText = await response.text();
      data = JSON.parse(responseText) as SubscriptionPlanApiResponse;
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError);
      throw new Error(
        `Failed to parse response: ${response.status} ${response.statusText}`
      );
    }

    if (!response.ok) {
      const errorMessage =
        data.message ||
        `Failed to create subscription plan (${response.status})`;
      console.error('❌ Create subscription plan error:', {
        status: response.status,
        statusText: response.statusText,
        data,
        requestData: planData
      });
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('❌ Error creating subscription plan:', error);
    throw error;
  }
}

// Update subscription plan
export async function updatePlan(
  id: number,
  planData: UpdatePlanRequest
): Promise<SubscriptionPlanApiResponse> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/subscription-plans/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      }
    );

    const data = (await response.json()) as SubscriptionPlanApiResponse;

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update subscription plan');
    }

    return data;
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    throw error;
  }
}

// Delete subscription plan
export async function deletePlan(id: number): Promise<{ status: number; message: string }> {
  try {
    const response = await fetchWithAuth(`/api/admin/subscription-plans/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = (await response.json()) as { status?: number; message?: string };

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete subscription plan');
    }

    return {
      status: data.status ?? 200,
      message: data.message ?? 'Plan deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    throw error;
  }
}

// Get plan features
export async function getPlanFeatures(
  planId: number
): Promise<PlanFeaturesApiResponse> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/subscription-plans/${planId}/features`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch plan features for plan ${planId}`);
    }
    const data = (await response.json()) as PlanFeaturesApiResponse;

    // Check if successful status (200 or 0)
    if (data.status === 200 || data.status === 0) {
      return data;
    } else {
      throw new Error(
        data.message || `Failed to fetch plan features for plan ${planId}`
      );
    }
  } catch (error) {
    console.error('Error fetching plan features:', error);
    return {
      status: 0,
      message: 'Network error',
      data: []
    };
  }
}

// Update plan features via PUT (backend may return 404 – use addPlanFeature with POST instead)
export async function updatePlanFeatures(
  planId: number,
  features: UpdatePlanFeaturesRequest
): Promise<PlanFeaturesApiResponse> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/subscription-plans/${planId}/features`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(features)
      }
    );

    let data: PlanFeaturesApiResponse;
    try {
      data = (await response.json()) as PlanFeaturesApiResponse;
    } catch {
      data = {
        status: response.status,
        message: response.statusText,
        data: []
      };
    }

    if (!response.ok) {
      if (response.status === 404 || response.status === 405) {
        return {
          status: response.status,
          message: data.message || 'Features endpoint not available',
          data: []
        };
      }
      throw new Error(data.message || 'Failed to update plan features');
    }

    return data;
  } catch (error) {
    console.error('Error updating plan features:', error);
    throw error;
  }
}

// Add a single feature via POST. On 404/405 (endpoint not supported) returns result without throwing.
export async function addPlanFeature(
  planId: number,
  body: AddPlanFeatureRequest
): Promise<{ ok: boolean; status: number; message: string; data?: unknown }> {
  try {
    const response = await fetchWithAuth(
      `/api/admin/subscription-plans/${planId}/features`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          featureType: body.featureType,
          featureKey: body.featureKey,
          ...(body.featureValue != null && { featureValue: body.featureValue })
        })
      }
    );

    const raw = await response.json().catch(() => ({}));
    const data = raw as { status?: number; message?: string; data?: unknown };

    if (!response.ok) {
      // Backend may not support POST for this feature type (405) or path (404) – do not throw
      if (response.status === 404 || response.status === 405) {
        return {
          ok: false,
          status: response.status,
          message: (data.message as string) || `Feature endpoint not available (${response.status})`,
          data: data.data
        };
      }
      throw new Error(
        (data.message as string) || `Failed to add plan feature (${response.status})`
      );
    }

    return {
      ok: true,
      status: data.status ?? 200,
      message: (data.message as string) ?? 'Feature added',
      data: data.data
    };
  } catch (error) {
    console.error('Error adding plan feature:', error);
    throw error;
  }
}
