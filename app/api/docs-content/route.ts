import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedServer, refreshAccessToken } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Extract URL parts upfront so they're available in catch/finally
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const language = searchParams.get('language') || 'en';
  try {
    if (!slug) {
      return NextResponse.json(
        {
          status: 400,
          error: 'Bad Request',
          message: 'Document slug is required'
        },
        { status: 400 }
      );
    }

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

    // Fetch specific document from your backend
    const docResponse = await fetch(
      `${backendUrl}/admin/docs/content/${slug}?language=${language}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': request.headers.get('user-agent') || '',
          'Content-Type': 'application/json'
        }
      }
    );

    if (docResponse.ok) {
      const docData = await docResponse.json();
      return NextResponse.json({
        status: 200,
        data: docData,
        message: 'Document retrieved successfully'
      });
    } else {
      let errorText = '';
      try {
        errorText = await docResponse.text();
      } catch {
        errorText = 'Could not read error response';
      }

      return NextResponse.json(
        {
          status: docResponse.status,
          error: 'Failed to fetch document',
          message: `${docResponse.status} ${docResponse.statusText}`,
          details: errorText,
          slug: slug,
          language: language
        },
        { status: docResponse.status }
      );
    }
  } catch (error) {
    console.error('💥 Document API error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error,
      slug: searchParams?.get('slug') || 'unknown',
      language: searchParams?.get('language') || 'unknown'
    });
    return NextResponse.json(
      {
        status: 500,
        error: 'Internal Server Error',
        message:
          error instanceof Error ? error.message : 'Failed to fetch document',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
