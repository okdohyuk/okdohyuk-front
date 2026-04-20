import { NextResponse } from 'next/server';
import { getAgentSkillArtifact } from '@libs/server/agentDiscoveryServer';

export async function GET() {
  return new NextResponse(getAgentSkillArtifact('site-navigation'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
