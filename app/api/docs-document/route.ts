import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const language = searchParams.get('language') || 'en';

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
    const token = request.cookies.get('access_token')?.value || null;

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
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
      const errorText = await docResponse
        .text()
        .catch(() => 'Could not read error response');
      console.error(
        '❌ Backend document response:',
        docResponse.status,
        docResponse.statusText,
        'Error body:',
        errorText
      );

      return NextResponse.json(
        {
          status: docResponse.status,
          error: 'Failed to fetch document',
          message: `${docResponse.status} ${docResponse.statusText}`,
          details: errorText
        },
        { status: docResponse.status }
      );
    }
  } catch (error) {
    console.error('💥 Document API error:', error);
    return NextResponse.json(
      {
        status: 500,
        error: 'Internal Server Error',
        message: 'Failed to fetch document'
      },
      { status: 500 }
    );
  }
}
