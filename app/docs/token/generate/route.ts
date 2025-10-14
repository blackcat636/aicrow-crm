import { NextRequest, NextResponse } from 'next/server';
import { getTokens, isAuthenticatedServer } from '@/lib/auth';

export const runtime = 'edge';

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

    // Get backend API URL from environment
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

    // Get expiresInMinutes from query params (default 60 minutes)
    const { searchParams } = new URL(request.url);
    const expiresInMinutes = searchParams.get('expiresInMinutes') || '60';

    // Request temporary token from backend
    const tokenUrl = `${backendUrl.replace(
      /\/$/,
      ''
    )}/admin/docs/token/generate?expiresInMinutes=${expiresInMinutes}`;

    const response = await fetch(tokenUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(
        '❌ Backend token error:',
        response.status,
        response.statusText
      );
      return new NextResponse('Failed to generate temporary token', {
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
    console.error('❌ Docs token generation error:', error);
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
