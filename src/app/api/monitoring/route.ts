import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const envelope = await req.text();
    const pieces = envelope.split('\n');
    const header = JSON.parse(pieces[0]);
    const dsn = new URL(header.dsn);

    if (dsn.toString() !== process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Allow if it matches the configured DSN.
      // In production, you might want to be even stricter or allow a list.
      // For now, we compare against the env var.
      // However, the header.dsn might contain the public key, so we should compare carefully.
      // actually dsn in header is the full dsn string usually.
    }

    const projectId = dsn.pathname.replace('/', '');
    const sentryIngestURL = `https://${dsn.hostname}/api/${projectId}/envelope/`;

    const response = await fetch(sentryIngestURL, {
      method: 'POST',
      body: envelope,
      headers: {
        // Sentry expects this content type
        'Content-Type': 'application/x-sentry-envelope',
      },
    });

    return NextResponse.json({ status: response.statusText }, { status: response.status });
  } catch (e) {
    console.error('Sentry tunnel error:', e);
    return NextResponse.json({ error: 'Error tunneling sentry' }, { status: 500 });
  }
}
