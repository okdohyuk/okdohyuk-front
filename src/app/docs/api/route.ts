import { NextRequest, NextResponse } from 'next/server';
import {
  appendAgentDiscoveryHeaders,
  estimateMarkdownTokens,
  isMarkdownRequest,
} from '@libs/shared/agentDiscovery';
import {
  getApiDocumentationHtml,
  getApiDocumentationMarkdown,
  getDefaultJsonHeaders,
} from '@libs/server/agentDiscoveryServer';

export async function GET(request: NextRequest) {
  if (isMarkdownRequest(request.headers.get('accept'))) {
    const markdown = getApiDocumentationMarkdown();
    const headers = getDefaultJsonHeaders('text/markdown; charset=utf-8');
    headers.set('x-markdown-tokens', estimateMarkdownTokens(markdown).toString());
    appendAgentDiscoveryHeaders(headers);
    return new NextResponse(markdown, { headers });
  }

  const headers = getDefaultJsonHeaders('text/html; charset=utf-8');
  appendAgentDiscoveryHeaders(headers);
  return new NextResponse(getApiDocumentationHtml(), { headers });
}
