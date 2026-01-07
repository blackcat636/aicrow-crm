import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// GET /admin/permissions/users/{userId}/roles - Get user roles
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid user ID'
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

    const backendUrl = `${API_URL}/admin/permissions/users/${userId}/roles`;

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
          message: errorData.message || 'Failed to fetch user roles'
        },
        { status: response.status }
      );
    }

    const rawData = await response.json();

    // Handle response format
    let rolesData: unknown[] = [];

    if (Array.isArray(rawData)) {
      rolesData = rawData;
    } else if (rawData.data && Array.isArray(rawData.data)) {
      rolesData = rawData.data;
    }

    const responseData = {
      status: rawData.status || 200,
      message: rawData.message || 'User roles retrieved successfully',
      data: rolesData,
      total: rawData.total || rolesData.length
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST /admin/permissions/users/{userId}/roles - Assign role to user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid user ID'
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { roleId, resourceFilters, expiresAt } = body;

    if (!roleId) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Missing required field: roleId'
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
      roleId: number;
      resourceFilters?: Record<string, unknown>;
      expiresAt?: string;
    } = {
      roleId: Number(roleId)
    };

    if (resourceFilters) {
      requestData.resourceFilters = resourceFilters;
    }

    if (expiresAt) {
      requestData.expiresAt = expiresAt;
    }

    const response = await fetch(
      `${API_URL}/admin/permissions/users/${userId}/roles`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader })
        },
        body: JSON.stringify(requestData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          status: response.status,
          message: errorData.message || 'Failed to assign role to user'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error assigning role to user:', error);
    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
