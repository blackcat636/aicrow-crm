import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// PATCH /admin/users/:id/status - Activate or block user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid user ID'
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (body.isActive === undefined) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Missing required field: isActive'
        },
        { status: 400 }
      );
    }

    // Validate isActive type
    if (typeof body.isActive !== 'boolean') {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid isActive: must be a boolean value'
        },
        { status: 400 }
      );
    }

    // Prepare request data
    const requestData = {
      isActive: Boolean(body.isActive)
    };

    // Get authorization token from request
    const authHeader = request.headers.get('authorization') || 
      (request.cookies.get('access_token')?.value ? `Bearer ${request.cookies.get('access_token')?.value}` : '');

    // Forward request to backend API
    const API_URL = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
    ).replace(/\/+$/, '');

    const response = await fetch(`${API_URL}/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json(
          {
            status: 404,
            message: 'User not found'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          status: response.status,
          message: errorData.message || 'Failed to update user status'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const statusMessage = requestData.isActive 
      ? 'User activated successfully' 
      : 'User blocked successfully. All user sessions have been terminated.';

    return NextResponse.json({
      status: 200,
      data: data.data || data,
      message: statusMessage
    });
  } catch (error) {
    console.error('Error updating user status:', error);

    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

