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

    // Fetch documentation tree structure from your backend
    const treeResponse = await fetch(`${backendUrl}/admin/docs/tree`, {
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
      const errorText = await treeResponse
        .text()
        .catch(() => 'Could not read error response');

      return NextResponse.json(
        {
          status: treeResponse.status,
          error: 'Failed to fetch documentation tree',
          message: `${treeResponse.status} ${treeResponse.statusText}`,
          details: errorText
        },
        { status: treeResponse.status }
      );
    }
  } catch {
    return NextResponse.json(
      {
        status: 500,
        error: 'Internal Server Error',
        message: 'Failed to fetch documentation tree'
      },
      { status: 500 }
    );
  }
}
