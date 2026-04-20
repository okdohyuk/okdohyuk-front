import { NextResponse } from 'next/server';
import { getDefaultJsonHeaders, getOpenIdConfiguration } from '@libs/server/agentDiscoveryServer';

export async function GET() {
  return new NextResponse(JSON.stringify(getOpenIdConfiguration(), null, 2), {
    headers: getDefaultJsonHeaders(),
  });
}
