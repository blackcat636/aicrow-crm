import { NextRequest, NextResponse } from 'next/server';

import {
  hasTranslatableContent,
  trimNullableTranslatableForBackend,
  trimTranslatableForBackend
} from '@/lib/translatable';

export const runtime = 'edge';

// Next route: GET/POST /admin/subscription-plans → backend /admin/subscription-plans
export async function GET(request: NextRequest) {
  try {
    const authHeader =
      request.headers.get('authorization') ||
      (request.cookies.get('access_token')?.value
        ? `Bearer ${request.cookies.get('access_token')?.value}`
        : '');

    const API_URL = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
    ).replace(/\/+$/, '');

    const qs = request.nextUrl.search;
    const response = await fetch(`${API_URL}/admin/subscription-plans${qs}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      }
    }).catch((fetchError) => {
      console.error('❌ Fetch error when calling backend API:', {
        url: `${API_URL}/admin/subscription-plans${qs}`,
        error:
          fetchError instanceof Error ? fetchError.message : String(fetchError),
        apiUrl: API_URL
      });
      throw new Error(
        `Failed to connect to backend API: ${
          fetchError instanceof Error ? fetchError.message : String(fetchError)
        }`
      );
    });

    if (!response.ok) {
      let errorData: { message?: string; error?: string } = {};
      const contentType = response.headers.get('content-type');

      try {
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          errorData = {
            message: text || `Backend returned status ${response.status}`
          };
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        errorData = { message: `Backend returned status ${response.status}` };
      }

      console.error('❌ Backend API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      return NextResponse.json(
        {
          status: response.status,
          message:
            errorData.message || errorData.error || 'Failed to fetch subscription plans'
        },
        { status: response.status }
      );
    }

    const rawData = await response.json();

    let plansData: unknown[] = [];

    if (Array.isArray(rawData)) {
      plansData = rawData;
    } else if (rawData.data && Array.isArray(rawData.data)) {
      plansData = rawData.data;
    }

    const responseData = {
      status: rawData.status || 200,
      message: rawData.message || 'Subscription plans retrieved successfully',
      data: plansData,
      total: rawData.total || plansData.length,
      page: rawData.page || 1,
      limit: rawData.limit || 100
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        status: 500,
        message: errorMessage || 'Failed to fetch subscription plans',
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, price, period } = body;

    if (!hasTranslatableContent(name) || price === undefined || !period) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Missing required fields: name, price, period'
        },
        { status: 400 }
      );
    }

    const authHeader =
      request.headers.get('authorization') ||
      (request.cookies.get('access_token')?.value
        ? `Bearer ${request.cookies.get('access_token')?.value}`
        : '');

    const API_URL = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
    ).replace(/\/+$/, '');

    const requestData = {
      name: trimTranslatableForBackend(name),
      description: trimNullableTranslatableForBackend(body.description),
      price: Number(price),
      period: period,
      trialDays: body.trialDays || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
      isDefault: body.isDefault !== undefined ? body.isDefault : false
    };

    const qsPost = request.nextUrl.search;
    const response = await fetch(`${API_URL}/admin/subscription-plans${qsPost}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...(authHeader && { Authorization: authHeader })
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      let errorData: { message?: string; error?: string } = {};
      const contentType = response.headers.get('content-type');

      try {
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          errorData = {
            message: text || `Backend returned status ${response.status}`
          };
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        errorData = { message: `Backend returned status ${response.status}` };
      }

      console.error('❌ Backend API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      return NextResponse.json(
        {
          status: response.status,
          message:
            errorData.message || errorData.error || 'Failed to create subscription plan'
        },
        { status: response.status }
      );
    }

    const rawData = await response.json();

    let planData = null;

    if (rawData.data) {
      planData = rawData.data;
    } else if (!Array.isArray(rawData) && rawData.id) {
      planData = rawData;
    }

    const responseData = {
      status: rawData.status || response.status,
      message: rawData.message || 'Subscription plan created successfully',
      data: planData
    };

    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('Error creating subscription plan:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        status: 500,
        message: errorMessage || 'Failed to create subscription plan',
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
