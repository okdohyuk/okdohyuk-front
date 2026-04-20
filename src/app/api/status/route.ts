import { NextResponse } from 'next/server';
import { absoluteUrl, DISCOVERY_PATHS, DISCOVERY_VERSION } from '@libs/shared/agentDiscovery';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'okdohyuk-front',
    version: DISCOVERY_VERSION,
    timestamp: new Date().toISOString(),
    links: {
      apiCatalog: absoluteUrl(DISCOVERY_PATHS.apiCatalog),
      apiDocs: absoluteUrl(DISCOVERY_PATHS.apiDocs),
      openApi: absoluteUrl(DISCOVERY_PATHS.publicOpenApi),
      mcp: absoluteUrl(DISCOVERY_PATHS.mcpServerCard),
    },
  });
}
