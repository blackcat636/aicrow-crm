import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedServer, refreshAccessToken } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Read JWT token from request cookies (server-side)
    let token = request.cookies.get('access_token')?.value || null;

    if (!token) {
      return NextResponse.json(
        {
          status: 401,
          error: 'Unauthorized',
          message: 'No access token provided'
        },
        { status: 401 }
      );
    }

    // Check if token is valid, if not try to refresh
    const isValid = await isAuthenticatedServer(token);
    if (!isValid) {
      const refreshResponse = await refreshAccessToken(request);

      if (refreshResponse) {
        // Get the new token from the refreshed response
        token = refreshResponse.cookies.get('access_token')?.value || token;
      } else {
        return NextResponse.json(
          {
            status: 401,
            error: 'Unauthorized',
            message: 'Token expired and refresh failed'
          },
          { status: 401 }
        );
      }
    }

    // Get backend API URL from environment
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

    const targetUrl = `${backendUrl}/admin/docs/tree`;

    // Fetch documentation tree from your backend
    const treeResponse = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': request.headers.get('user-agent') || '',
        'Content-Type': 'application/json'
      }
    });

    if (treeResponse.ok) {
      const treeData = await treeResponse.json();
      return NextResponse.json({
        status: 200,
        data: treeData,
        message: 'Documentation tree retrieved successfully'
      });
    } else {
      let errorText = '';
      try {
        errorText = await treeResponse.text();
      } catch {
        errorText = 'Could not read error response';
      }

      return NextResponse.json(
        {
          status: treeResponse.status,
          error: 'Failed to fetch documentation tree',
          message: `${treeResponse.status} ${treeResponse.statusText}`,
          details: errorText,
          url: targetUrl
        },
        { status: treeResponse.status }
      );
    }
  } catch (error) {
    console.error('💥 Tree API error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return NextResponse.json(
      {
        status: 500,
        error: 'Internal Server Error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch documentation tree',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
