import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// GET /admin/permissions/users/{userId}/permissions - Get user permissions
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

    const response = await fetch(
      `${API_URL}/admin/permissions/users/${userId}/permissions`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader })
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          status: response.status,
          message: errorData.message || 'Failed to fetch user permissions'
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
      permissionsData = rawData;
    } else if (rawData.data && Array.isArray(rawData.data)) {
      permissionsData = rawData.data;
    }

    const responseData = {
      status: rawData.status || 200,
      message: rawData.message || 'User permissions retrieved successfully',
      data: permissionsData,
      total: rawData.total || permissionsData.length
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
