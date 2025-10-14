import { NextRequest, NextResponse } from 'next/server';
import { getTokens, isAuthenticatedServer } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const { accessToken } = getTokens(request);

    if (!accessToken) {
      console.error('❌ No access token found');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Validate token
    const isValid = await isAuthenticatedServer(accessToken);
    if (!isValid) {
      console.error('❌ Invalid access token');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const language = searchParams.get('language') || 'en';

    if (!slug) {
      return NextResponse.json(
        {
          error: 'Slug parameter is required'
        },
        { status: 400 }
      );
    }

    // Get backend API URL from environment
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

    // Proxy request to backend docs content
    const contentUrl = `${backendUrl.replace(
      /\/$/,
      ''
    )}/admin/docs/content/${slug}?language=${language}`;

    const response = await fetch(contentUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': request.headers.get('user-agent') || '',
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      console.error(
        '❌ Backend content error:',
        response.status,
        response.statusText
      );
      return new NextResponse('Failed to fetch docs content', {
        status: response.status
      });
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    });
  } catch (error) {
    console.error('❌ Docs content proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
