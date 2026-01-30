import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// GET /admin/subscription-plans/{id}/features - Get plan features
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

    const backendUrl = `${API_URL}/admin/subscription-plans/${id}/features`;

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
          message: errorData.message || 'Failed to fetch plan features'
        },
        { status: response.status }
      );
    }

    const rawData = await response.json();

    // Handle response format
    let featuresData: unknown[] = [];

    if (Array.isArray(rawData)) {
      featuresData = rawData;
    } else if (rawData.data && Array.isArray(rawData.data)) {
      featuresData = rawData.data;
    }

    const responseData = {
      status: rawData.status || 200,
      message: rawData.message || 'Plan features retrieved successfully',
      data: featuresData
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching plan features:', error);
    return NextResponse.json(
      {
        status: 500,
        message: 'Failed to fetch plan features',
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT /admin/subscription-plans/{id}/features - Update plan features
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

    if (!body.features || !Array.isArray(body.features)) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Missing required field: features (array)'
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

    const backendUrl = `${API_URL}/admin/subscription-plans/${id}/features`;

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...(authHeader && { Authorization: authHeader })
      },
      body: JSON.stringify({ features: body.features })
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
            errorData.message ||
            errorData.error ||
            'Failed to update plan features'
        },
        { status: response.status }
      );
    }

    const rawData = await response.json();

    // Handle response format
    let featuresData: unknown[] = [];

    if (Array.isArray(rawData)) {
      featuresData = rawData;
    } else if (rawData.data && Array.isArray(rawData.data)) {
      featuresData = rawData.data;
    }

    const responseData = {
      status: rawData.status || response.status,
      message: rawData.message || 'Plan features updated successfully',
      data: featuresData
    };

    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('Error updating plan features:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        status: 500,
        message: errorMessage || 'Failed to update plan features',
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
