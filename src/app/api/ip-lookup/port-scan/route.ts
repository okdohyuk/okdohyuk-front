import { NextRequest, NextResponse } from 'next/server';
import * as net from 'net';

export const runtime = 'nodejs';

export interface PortInfo {
  port: number;
  service: string;
  description: string;
  status: 'open' | 'closed' | 'filtered' | 'scanning';
}

const COMMON_PORTS: Omit<PortInfo, 'status'>[] = [
  { port: 21, service: 'FTP', description: 'File Transfer Protocol' },
  { port: 22, service: 'SSH', description: 'Secure Shell' },
  { port: 23, service: 'Telnet', description: 'Telnet Remote Login' },
  { port: 25, service: 'SMTP', description: 'Simple Mail Transfer Protocol' },
  { port: 53, service: 'DNS', description: 'Domain Name System' },
  { port: 80, service: 'HTTP', description: 'Hypertext Transfer Protocol' },
  { port: 110, service: 'POP3', description: 'Post Office Protocol v3' },
  { port: 143, service: 'IMAP', description: 'Internet Message Access Protocol' },
  { port: 443, service: 'HTTPS', description: 'HTTP Secure' },
  { port: 445, service: 'SMB', description: 'Server Message Block' },
  { port: 3306, service: 'MySQL', description: 'MySQL Database' },
  { port: 3389, service: 'RDP', description: 'Remote Desktop Protocol' },
  { port: 5432, service: 'PostgreSQL', description: 'PostgreSQL Database' },
  { port: 6379, service: 'Redis', description: 'Redis In-Memory Database' },
  { port: 8080, service: 'HTTP-Alt', description: 'HTTP Alternate Port' },
  { port: 8443, service: 'HTTPS-Alt', description: 'HTTPS Alternate Port' },
  { port: 27017, service: 'MongoDB', description: 'MongoDB Database' },
];

const TIMEOUT_MS = 3000;

function checkPort(ip: string, port: number): Promise<'open' | 'closed' | 'filtered'> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    const done = (status: 'open' | 'closed' | 'filtered') => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(status);
      }
    };

    socket.setTimeout(TIMEOUT_MS);

    socket.on('connect', () => done('open'));
    socket.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ECONNREFUSED') {
        done('closed');
      } else {
        done('filtered');
      }
    });
    socket.on('timeout', () => done('filtered'));

    socket.connect(port, ip);
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');

  if (!ip) {
    return NextResponse.json({ error: 'ip parameter is required' }, { status: 400 });
  }

  // Basic IP validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^[0-9a-fA-F:]+$/;
  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
    return NextResponse.json({ error: 'Invalid IP address format' }, { status: 400 });
  }

  try {
    const results = await Promise.all(
      COMMON_PORTS.map(async (portInfo) => {
        const status = await checkPort(ip, portInfo.port);
        return { ...portInfo, status } as PortInfo;
      }),
    );

    return NextResponse.json({ ip, ports: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Port scan failed: ${message}` }, { status: 500 });
  }
}
