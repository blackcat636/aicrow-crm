import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// GET /admin/subscription-plans/{id} - Get subscription plan by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid subscription plan ID'
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

    const backendUrl = `${API_URL}/admin/subscription-plans/${id}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          status: response.status,
          message: errorData.message || 'Failed to fetch subscription plan'
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
      status: rawData.status || 200,
      message: rawData.message || 'Subscription plan retrieved successfully',
      data: planData
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    return NextResponse.json(
      {
        status: 500,
        message: 'Failed to fetch subscription plan',
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT /admin/subscription-plans/{id} - Update subscription plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid subscription plan ID'
        },
        { status: 400 }
      );
    }

    const body = await request.json();

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

    const requestData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      requestData.name = body.name.trim();
    }
    if (body.description !== undefined) {
      requestData.description = body.description;
    }
    if (body.price !== undefined) {
      requestData.price = Number(body.price);
    }
    if (body.period !== undefined) {
      requestData.period = body.period;
    }
    if (body.trialDays !== undefined) {
      requestData.trialDays = Number(body.trialDays);
    }
    if (body.isActive !== undefined) {
      requestData.isActive = body.isActive;
    }
    if (body.isDefault !== undefined) {
      requestData.isDefault = body.isDefault;
    }

    const backendUrl = `${API_URL}/admin/subscription-plans/${id}`;

    const response = await fetch(backendUrl, {
      method: 'PUT',
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

      return NextResponse.json(
        {
          status: response.status,
          message:
            errorData.message || errorData.error || 'Failed to update subscription plan'
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
      message: rawData.message || 'Subscription plan updated successfully',
      data: planData
    };

    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('Error updating subscription plan:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        status: 500,
        message: errorMessage || 'Failed to update subscription plan',
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
