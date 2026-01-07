import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// GET /admin/permissions/roles - Get all roles
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

    const response = await fetch(`${API_URL}/admin/permissions/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      }
    }).catch((fetchError) => {
      console.error('❌ Fetch error when calling backend API:', {
        url: `${API_URL}/admin/permissions/roles`,
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
            errorData.message || errorData.error || 'Failed to fetch roles'
        },
        { status: response.status }
      );
    }

    const rawData = await response.json();

    // Handle response format - backend can return either:
    // 1. Direct array: [...]
    // 2. Wrapped object: { status, message, data: [...] }
    let rolesData: unknown[] = [];

    if (Array.isArray(rawData)) {
      // Direct array response
      rolesData = rawData;
    } else if (rawData.data && Array.isArray(rawData.data)) {
      // Wrapped response with data field
      rolesData = rawData.data;
    }

    const responseData = {
      status: rawData.status || 200,
      message: rawData.message || 'Roles retrieved successfully',
      data: rolesData,
      total: rawData.total || rolesData.length,
      page: rawData.page || 1,
      limit: rawData.limit || 100
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching roles:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack:
              process.env.NODE_ENV === 'development' ? error.stack : undefined
          }
        : { error: String(error) };

    return NextResponse.json(
      {
        status: 500,
        message: errorMessage || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { details: errorDetails })
      },
      { status: 500 }
    );
  }
}

// POST /admin/permissions/roles - Create new role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, description, permissionIds, conditions } = body;

    if (!name || !description) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Missing required fields: name, description'
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

    const requestData: {
      name: string;
      description: string;
      permissionIds?: number[];
      conditions?: Record<string, unknown> | null;
    } = {
      name: name.trim(),
      description: description.trim()
    };

    // Add permissionIds if provided
    if (
      permissionIds &&
      Array.isArray(permissionIds) &&
      permissionIds.length > 0
    ) {
      requestData.permissionIds = permissionIds;
    }

    // Add conditions if provided
    if (conditions) {
      requestData.conditions = conditions;
    }

    const response = await fetch(`${API_URL}/admin/permissions/roles`, {
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
          errorData = { message: text || 'Failed to create role' };
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
            `Failed to create role (${response.status})`
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: 200,
      data: data.data || data,
      message: 'Role created successfully'
    });
  } catch (error) {
    console.error('Error creating role:', error);

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
