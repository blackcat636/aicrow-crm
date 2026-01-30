import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// GET /admin/subscription-plans - Get all subscription plans
export async function GET(request: NextRequest) {
  try {
    // Get authorization token from request
    const authHeader =
      request.headers.get('authorization') ||
      (request.cookies.get('access_token')?.value
        ? `Bearer ${request.cookies.get('access_token')?.value}`
        : '');

    // Forward request to backend API
    const API_URL = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
    ).replace(/\/+$/, '');

    const response = await fetch(`${API_URL}/admin/subscription-plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      }
    }).catch((fetchError) => {
      console.error('❌ Fetch error when calling backend API:', {
        url: `${API_URL}/admin/subscription-plans`,
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

    // Handle response format - backend can return either:
    // 1. Direct array: [...]
    // 2. Wrapped object: { status, message, data: [...] }
    let plansData: unknown[] = [];

    if (Array.isArray(rawData)) {
      // Direct array response
      plansData = rawData;
    } else if (rawData.data && Array.isArray(rawData.data)) {
      // Wrapped response with data field
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

// POST /admin/subscription-plans - Create new subscription plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields (backend does not accept tokensIncluded on plan)
    const { name, price, period } = body;

    if (!name || price === undefined || !period) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Missing required fields: name, price, period'
        },
        { status: 400 }
      );
    }

    // Get authorization token from request
    const authHeader =
      request.headers.get('authorization') ||
      (request.cookies.get('access_token')?.value
        ? `Bearer ${request.cookies.get('access_token')?.value}`
        : '');

    // Forward request to backend API
    const API_URL = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
    ).replace(/\/+$/, '');

    const requestData = {
      name: name.trim(),
      description: body.description || null,
      price: Number(price),
      period: period,
      trialDays: body.trialDays || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
      isDefault: body.isDefault !== undefined ? body.isDefault : false
    };

    const response = await fetch(`${API_URL}/admin/subscription-plans`, {
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

    // Handle response format
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
