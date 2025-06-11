import { NextRequest, NextResponse } from 'next/server';

const TICKETING_SITES: { [key: string]: string } = {
  ticketlink: 'https://www.ticketlink.co.kr',
  yes24: 'https://ticket.yes24.com',
  interpark: 'https://ticket.interpark.com',
  melon: 'https://ticket.melon.com',
  auction: 'http://ticket.auction.co.kr',
  nol: 'https://www.nolticket.com',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const site = searchParams.get('site');
  let targetUrl: string;

  if (!site) {
    return NextResponse.json({ error: 'A site parameter is required.' }, { status: 400 });
  }

  // Check if the site is a predefined key
  if (TICKETING_SITES[site]) {
    targetUrl = TICKETING_SITES[site];
  } else {
    // Otherwise, treat it as a custom URL
    try {
      const url = new URL(site);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Invalid protocol. Only http and https are allowed.');
      }
      targetUrl = url.toString();
    } catch (e) {
      return NextResponse.json(
        {
          error: 'A valid site key or a full, valid URL is required.',
          availableSites: Object.keys(TICKETING_SITES),
        },
        { status: 400 },
      );
    }
  }

  try {
    const response = await fetch(targetUrl, { method: 'HEAD', cache: 'no-store' });
    const serverDate = response.headers.get('date');

    if (!serverDate) {
      return NextResponse.json(
        { error: 'Could not retrieve server time from the Date header.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ site, serverTime: new Date(serverDate).toISOString() });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    // console.error(`Error fetching server time for ${site} (${targetUrl}):`, errorMessage);
    return NextResponse.json(
      { error: `Failed to fetch server time: ${errorMessage}` },
      { status: 500 },
    );
  }
}
