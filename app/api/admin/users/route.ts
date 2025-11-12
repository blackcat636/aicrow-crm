import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// GET /admin/users - Get users with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';

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

    // Build query parameters
    const params = new URLSearchParams({
      page,
      limit
    });

    if (search.trim()) {
      params.append('search', search.trim());
    }

    const response = await fetch(`${API_URL}/admin/users?${params}`, {
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
          message: errorData.message || 'Failed to fetch users'
        },
        { status: response.status }
      );
    }

    const rawData = await response.json();

    // Handle both response formats:
    // Format 1: { status: 200, data: [...], total, page, limit }
    // Format 2: { status: 200, data: { items: [...], total, page, limit } }
    let responseData;

    if (rawData.data && Array.isArray(rawData.data.items)) {
      // Format 2: nested structure
      responseData = {
        status: rawData.status || 200,
        message: rawData.message || 'Users retrieved successfully',
        data: rawData.data.items,
        total: rawData.data.total || 0,
        page: rawData.data.page || parseInt(page),
        limit: rawData.data.limit || parseInt(limit)
      };
    } else if (Array.isArray(rawData.data)) {
      // Format 1: flat structure with data array
      responseData = {
        status: rawData.status || 200,
        message: rawData.message || 'Users retrieved successfully',
        data: rawData.data,
        total: rawData.total || 0,
        page: rawData.page || parseInt(page),
        limit: rawData.limit || parseInt(limit)
      };
    } else {
      // Fallback: try to use rawData as is
      responseData = {
        status: rawData.status || 200,
        message: rawData.message || 'Users retrieved successfully',
        data: Array.isArray(rawData.data) ? rawData.data : [],
        total: rawData.total || 0,
        page: rawData.page || parseInt(page),
        limit: rawData.limit || parseInt(limit)
      };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching users:', error);

    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST /admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      email,
      username,
      password,
      firstName,
      lastName,
      role,
      isEmailVerified,
      isActive
    } = body;

    if (!email || !username || !password || !firstName || !lastName) {
      return NextResponse.json(
        {
          status: 400,
          message:
            'Missing required fields: email, username, password, firstName, lastName'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid email format'
        },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Password must be at least 8 characters long'
        },
        { status: 400 }
      );
    }

    // Validate role if provided
    if (role && !['user', 'admin'].includes(role)) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid role. Must be "user" or "admin"'
        },
        { status: 400 }
      );
    }

    // Prepare request data
    const requestData = {
      email: email.trim(),
      username: username.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role || 'user',
      isEmailVerified:
        isEmailVerified !== undefined ? Boolean(isEmailVerified) : false,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    };

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

    console.log('🔵 Forwarding to backend:', {
      url: `${API_URL}/admin/users`,
      method: 'POST',
      data: { ...requestData, password: '***' }
    });

    const response = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...(authHeader && { Authorization: authHeader })
      },
      body: JSON.stringify(requestData)
    });

    console.log('🔵 Backend response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorData: { message?: string; error?: string } = {};
      const contentType = response.headers.get('content-type');

      try {
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          errorData = { message: text || 'Failed to create user' };
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        errorData = { message: `Backend returned status ${response.status}` };
      }

      console.error('❌ Backend error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        requestData: { ...requestData, password: '***' }
      });

      // Handle specific error cases
      if (response.status === 409) {
        return NextResponse.json(
          {
            status: 409,
            message:
              errorData.message ||
              'User with this email or username already exists'
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          status: response.status,
          message:
            errorData.message ||
            errorData.error ||
            `Failed to create user (${response.status})`
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: 200,
      data: data.data || data,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);

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
