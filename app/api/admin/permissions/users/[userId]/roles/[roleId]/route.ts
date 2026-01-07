import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// DELETE /admin/permissions/users/{userId}/roles/{roleId} - Remove role from user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; roleId: string }> }
) {
  try {
    const { userId, roleId } = await params;

    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid user ID'
        },
        { status: 400 }
      );
    }

    if (!roleId || isNaN(Number(roleId))) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid role ID'
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
      `${API_URL}/admin/permissions/users/${userId}/roles/${roleId}`,
      {
        method: 'DELETE',
        headers: {
          ...(authHeader && { Authorization: authHeader })
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          status: response.status,
          message: errorData.message || 'Failed to remove role from user'
        },
        { status: response.status }
      );
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json({
      status: 200,
      message: data.message || 'Role removed from user successfully',
      data: data.data || null
    });
  } catch (error) {
    console.error('Error removing role from user:', error);
    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
