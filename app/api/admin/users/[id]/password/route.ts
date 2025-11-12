import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// PATCH /admin/users/:id/password - Change user password
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
    if (!body.password) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Missing required field: password'
        },
        { status: 400 }
      );
    }

    if (!body.confirmPassword) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Missing required field: confirmPassword'
        },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 8 characters)
    if (body.password.length < 8) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Password must be at least 8 characters long'
        },
        { status: 400 }
      );
    }

    if (body.confirmPassword.length < 8) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Confirm password must be at least 8 characters long'
        },
        { status: 400 }
      );
    }

    // Validate passwords match
    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Passwords do not match'
        },
        { status: 400 }
      );
    }

    // Prepare request data
    // Backend expects 'newPassword' and 'confirmPassword' fields
    const requestData = {
      newPassword: body.password,
      confirmPassword: body.confirmPassword
    };

    // Get authorization token from request
    const authHeader = request.headers.get('authorization') || 
      (request.cookies.get('access_token')?.value ? `Bearer ${request.cookies.get('access_token')?.value}` : '');

    // Forward request to backend API
    const API_URL = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
    ).replace(/\/+$/, '');

    const response = await fetch(`${API_URL}/admin/users/${id}/password`, {
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
          message: errorData.message || 'Failed to change password'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: 200,
      data: data.data || data,
      message: 'Password changed successfully. All user sessions have been terminated.'
    });
  } catch (error) {
    console.error('Error changing password:', error);

    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

