import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Read JWT token from request cookies (server-side)
    const token = request.cookies.get('access_token')?.value || null;

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get backend API URL from environment
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

    // Proxy request to backend documentation endpoint
    const response = await fetch(`${backendUrl}/admin/docs/index`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': request.headers.get('user-agent') || ''
      }
    });

    if (!response.ok) {
      console.error(
        'Backend docs response:',
        response.status,
        response.statusText
      );
      return new NextResponse('Failed to fetch documentation', {
        status: response.status
      });
    }

    const html = await response.text();

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Documentation proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
