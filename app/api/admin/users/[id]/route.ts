import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// PUT /admin/users/:id - Update user
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
          message: 'Invalid user ID'
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate email format if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          {
            status: 400,
            message: 'Invalid email format'
          },
          { status: 400 }
        );
      }
    }

    // Validate role if provided
    if (body.role && !['user', 'admin'].includes(body.role)) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid role. Must be "user" or "admin"'
        },
        { status: 400 }
      );
    }

    // Prepare request data - only include provided fields
    const requestData: Record<string, string | boolean | null> = {};
    
    if (body.email !== undefined) requestData.email = body.email.trim();
    if (body.username !== undefined) requestData.username = body.username.trim();
    if (body.firstName !== undefined) requestData.firstName = body.firstName.trim();
    if (body.lastName !== undefined) requestData.lastName = body.lastName.trim();
    if (body.phone !== undefined) requestData.phone = body.phone ? body.phone.trim() : null;
    if (body.timezone !== undefined) requestData.timezone = body.timezone;
    if (body.role !== undefined) requestData.role = body.role;
    if (body.isEmailVerified !== undefined) requestData.isEmailVerified = Boolean(body.isEmailVerified);
    if (body.isActive !== undefined) requestData.isActive = Boolean(body.isActive);
    if (body.referredByCode !== undefined) requestData.referredByCode = body.referredByCode ? body.referredByCode.trim() : null;

    // Get authorization token from request
    const authHeader = request.headers.get('authorization') || 
      (request.cookies.get('access_token')?.value ? `Bearer ${request.cookies.get('access_token')?.value}` : '');

    // Forward request to backend API
    const API_URL = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
    ).replace(/\/+$/, '');

    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error cases
      if (response.status === 404) {
        return NextResponse.json(
          {
            status: 404,
            message: 'User not found'
          },
          { status: 404 }
        );
      }

      if (response.status === 409) {
        return NextResponse.json(
          {
            status: 409,
            message: errorData.message || 'User with this email or username already exists'
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          status: response.status,
          message: errorData.message || 'Failed to update user'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: 200,
      data: data.data || data,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);

    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE /admin/users/:id - Soft delete user
export async function DELETE(
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

    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
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

      return NextResponse.json(
        {
          status: response.status,
          message: errorData.message || 'Failed to delete user'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: 200,
      data: data.data || data,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);

    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

