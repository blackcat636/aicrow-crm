import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// GET /admin/permissions/permissions - Get all permissions
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

    const response = await fetch(`${API_URL}/admin/permissions/permissions`, {
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
          message: errorData.message || 'Failed to fetch permissions'
        },
        { status: response.status }
      );
    }

    const rawData = await response.json();

    // Handle response format - backend can return either:
    // 1. Direct array: [...]
    // 2. Wrapped object: { status, message, data: [...] }
    let permissionsData: unknown[] = [];

    if (Array.isArray(rawData)) {
      // Direct array response
      permissionsData = rawData;
    } else if (rawData.data && Array.isArray(rawData.data)) {
      // Wrapped response with data field
      permissionsData = rawData.data;
    }

    const responseData = {
      status: rawData.status || 200,
      message: rawData.message || 'Permissions retrieved successfully',
      data: permissionsData,
      total: rawData.total || permissionsData.length,
      page: rawData.page || 1,
      limit: rawData.limit || 100
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching permissions:', error);

    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST /admin/permissions/permissions - Create new permission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, resource, action, description } = body;

    if (!name || !resource || !action || !description) {
      return NextResponse.json(
        {
          status: 400,
          message:
            'Missing required fields: name, resource, action, description'
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
      resource: resource.trim(),
      action: action.trim(),
      description: description.trim()
    };

    const response = await fetch(`${API_URL}/admin/permissions/permissions`, {
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
          errorData = { message: text || 'Failed to create permission' };
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
            `Failed to create permission (${response.status})`
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: 200,
      data: data.data || data,
      message: 'Permission created successfully'
    });
  } catch (error) {
    console.error('Error creating permission:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json(
      {
        status: 500,
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
