import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// POST /admin/users/:id/resend-verification - Resend email verification
export async function POST(
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

    // Get authorization token from request
    const authHeader = request.headers.get('authorization') || 
      (request.cookies.get('access_token')?.value ? `Bearer ${request.cookies.get('access_token')?.value}` : '');

    // Forward request to backend API
    const API_URL = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
    ).replace(/\/+$/, '');

    const response = await fetch(`${API_URL}/admin/users/${id}/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      }
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

      if (response.status === 400) {
        return NextResponse.json(
          {
            status: 400,
            message: errorData.message || 'Email is already verified or user does not need verification'
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          status: response.status,
          message: errorData.message || 'Failed to resend verification email'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: 200,
      data: data.data || data,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Error resending verification email:', error);

    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

