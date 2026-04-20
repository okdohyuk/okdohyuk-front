import { NextResponse } from 'next/server';
import { getDefaultJsonHeaders, getJwksProxyUrl } from '@libs/server/agentDiscoveryServer';

export async function GET() {
  try {
    const response = await fetch(getJwksProxyUrl(), { next: { revalidate: 3600 } });
    if (!response.ok) {
      throw new Error(`Upstream JWKS responded with ${response.status}`);
    }

    const body = await response.text();
    return new NextResponse(body, { headers: getDefaultJsonHeaders() });
  } catch {
    return new NextResponse(JSON.stringify({ keys: [] }), { headers: getDefaultJsonHeaders() });
  }
}
