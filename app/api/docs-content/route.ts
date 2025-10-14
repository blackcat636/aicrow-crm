import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedServer, refreshAccessToken } from '@/lib/auth';

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
      console.log('🔄 Token expired, attempting to refresh...');
      const refreshResponse = await refreshAccessToken(request);

      if (refreshResponse) {
        console.log('✅ Token refreshed successfully');
        // Get the new token from the refreshed response
        token = refreshResponse.cookies.get('access_token')?.value || token;
      } else {
        console.log('❌ Failed to refresh token');
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
      console.log('✅ Document retrieved successfully:', slug);
      return NextResponse.json({
        status: 200,
        data: docData,
        message: 'Document retrieved successfully'
      });
    } else {
      let errorText = '';
      try {
        errorText = await docResponse.text();
        console.log('📄 Backend document error response:', errorText);
      } catch (textError) {
        console.log(
          '⚠️ Could not read backend document error response:',
          textError
        );
        errorText = 'Could not read error response';
      }

      console.log('❌ Backend document request failed:', {
        status: docResponse.status,
        statusText: docResponse.statusText,
        slug: slug,
        language: language,
        errorText:
          errorText.substring(0, 200) + (errorText.length > 200 ? '...' : '')
      });

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
