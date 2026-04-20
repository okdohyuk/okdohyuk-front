import { NextResponse } from 'next/server';
import {
  getDefaultJsonHeaders,
  getOauthProtectedResourceMetadata,
} from '@libs/server/agentDiscoveryServer';

export async function GET() {
  return new NextResponse(JSON.stringify(getOauthProtectedResourceMetadata(), null, 2), {
    headers: getDefaultJsonHeaders(),
  });
}
