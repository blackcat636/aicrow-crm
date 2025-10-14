import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedServer, refreshAccessToken } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const ua = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  try {
    let token = request.cookies.get('access_token')?.value || null;
    if (!token) {
      console.warn('❌ [/api/docs] No access token', { ua, ip });
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const valid = await isAuthenticatedServer(token);
    if (!valid) {
      const refreshRes = await refreshAccessToken(request);
      if (refreshRes) {
        token = refreshRes.cookies.get('access_token')?.value || token;
      } else {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';
    const upstream = `${backendUrl}/admin/docs/index`;

    const upstreamRes = await fetch(upstream, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': ua,
        Accept: 'text/html'
      },
      cache: 'no-store'
    });

    if (!upstreamRes.ok) {
      const text = await upstreamRes.text().catch(() => '');
      console.error('❌ [/api/docs] Upstream error', {
        status: upstreamRes.status,
        statusText: upstreamRes.statusText,
        preview: text.substring(0, 300)
      });
      return new NextResponse(`Upstream error: ${upstreamRes.status}`, {
        status: upstreamRes.status
      });
    }

    const html = await upstreamRes.text();
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  } catch (e) {
    console.error('💥 [/api/docs] Proxy error', e);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
