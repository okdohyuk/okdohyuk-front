import { NextResponse } from 'next/server';
import { getApiCatalogDocument, getDefaultJsonHeaders } from '@libs/server/agentDiscoveryServer';

export async function GET() {
  const headers = getDefaultJsonHeaders(
    'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"; charset=utf-8',
  );

  return new NextResponse(JSON.stringify(getApiCatalogDocument(), null, 2), { headers });
}
