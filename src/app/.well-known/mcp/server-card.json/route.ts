import { NextResponse } from 'next/server';
import { getDefaultJsonHeaders, getMcpServerCardDocument } from '@libs/server/agentDiscoveryServer';

export async function GET() {
  return new NextResponse(JSON.stringify(getMcpServerCardDocument(), null, 2), {
    headers: getDefaultJsonHeaders(),
  });
}
