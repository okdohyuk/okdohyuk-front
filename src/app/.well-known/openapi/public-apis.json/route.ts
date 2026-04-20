import { NextResponse } from 'next/server';
import {
  getDefaultJsonHeaders,
  getPublicApisOpenApiDocument,
} from '@libs/server/agentDiscoveryServer';

export async function GET() {
  return new NextResponse(JSON.stringify(getPublicApisOpenApiDocument(), null, 2), {
    headers: getDefaultJsonHeaders(),
  });
}
