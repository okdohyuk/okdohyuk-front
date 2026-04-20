import { NextRequest, NextResponse } from 'next/server';
import {
  getDefaultJsonHeaders,
  getMcpInitializeResult,
  getMcpToolCallResult,
  getMcpToolsListResult,
} from '@libs/server/agentDiscoveryServer';

function jsonRpcError(id: unknown, code: number, message: string) {
  return {
    jsonrpc: '2.0',
    id: id ?? null,
    error: {
      code,
      message,
    },
  };
}

export async function GET() {
  return NextResponse.json({
    name: 'okdohyuk-site',
    endpoint: '/mcp',
    transport: 'streamable-http',
  });
}

export async function POST(request: NextRequest) {
  const headers = getDefaultJsonHeaders();
  headers.set('Mcp-Protocol-Version', '2025-06-18');

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse(JSON.stringify(jsonRpcError(null, -32700, 'Parse error')), {
      status: 400,
      headers,
    });
  }

  const { id = null, method, params } = payload ?? {};

  if (method === 'initialize') {
    return new NextResponse(
      JSON.stringify({ jsonrpc: '2.0', id, result: getMcpInitializeResult() }),
      { headers },
    );
  }

  if (method === 'tools/list') {
    return new NextResponse(
      JSON.stringify({ jsonrpc: '2.0', id, result: getMcpToolsListResult() }),
      { headers },
    );
  }

  if (method === 'tools/call') {
    const name = params?.name;
    const args = typeof params?.arguments === 'object' && params?.arguments ? params.arguments : {};
    const result = typeof name === 'string' ? getMcpToolCallResult(name, args) : null;

    if (!result) {
      return new NextResponse(
        JSON.stringify(jsonRpcError(id, -32601, `Unknown tool: ${String(name)}`)),
        { status: 404, headers },
      );
    }

    return new NextResponse(JSON.stringify({ jsonrpc: '2.0', id, result }), { headers });
  }

  if (method === 'ping') {
    return new NextResponse(JSON.stringify({ jsonrpc: '2.0', id, result: {} }), { headers });
  }

  return new NextResponse(
    JSON.stringify(jsonRpcError(id, -32601, `Unknown method: ${String(method)}`)),
    {
      status: 404,
      headers,
    },
  );
}
