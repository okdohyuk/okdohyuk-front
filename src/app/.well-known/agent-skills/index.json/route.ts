import { NextResponse } from 'next/server';
import {
  getAgentSkillsIndexDocument,
  getDefaultJsonHeaders,
} from '@libs/server/agentDiscoveryServer';

export async function GET() {
  return new NextResponse(JSON.stringify(getAgentSkillsIndexDocument(), null, 2), {
    headers: getDefaultJsonHeaders(),
  });
}
