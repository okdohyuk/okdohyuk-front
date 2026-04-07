import { NextRequest, NextResponse } from 'next/server';
import { promises as dnsPromises } from 'dns';

export const runtime = 'nodejs';

const PRIVATE_IP_REGEX =
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc|fd|fe80)/i;

function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();

  return '';
}

const FIELDS =
  'status,message,continent,continentCode,country,countryCode,regionName,region,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query';

async function fetchIpApiData(ip: string): Promise<Response> {
  const url = ip
    ? `http://ip-api.com/json/${ip}?fields=${FIELDS}`
    : `http://ip-api.com/json/?fields=${FIELDS}`;
  return fetch(url, { cache: 'no-store' });
}

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const isPrivate = !clientIp || PRIVATE_IP_REGEX.test(clientIp);

  try {
    // For private/loopback IPs (local dev), fall back to auto-detect (server's public IP)
    let response = await fetchIpApiData(isPrivate ? '' : clientIp);

    if (!response.ok) {
      throw new Error(`ip-api.com responded with ${response.status}`);
    }

    let data = await response.json();

    // If ip-api still returns reserved range, retry with auto-detect
    if (data.status === 'fail' && data.message === 'reserved range') {
      response = await fetchIpApiData('');
      if (!response.ok) throw new Error(`ip-api.com responded with ${response.status}`);
      data = await response.json();
    }

    if (data.status === 'fail') {
      return NextResponse.json({ error: data.message || 'IP lookup failed' }, { status: 400 });
    }

    // Try reverse DNS if not provided by ip-api
    let hostname = data.reverse || null;
    if (!hostname && data.query) {
      try {
        const hostnames = await dnsPromises.reverse(data.query);
        hostname = hostnames[0] || null;
      } catch {
        // Reverse lookup failed - normal for many IPs
      }
    }

    return NextResponse.json({
      ip: data.query,
      continent: data.continent,
      continentCode: data.continentCode,
      country: data.country,
      countryCode: data.countryCode,
      regionName: data.regionName,
      region: data.region,
      city: data.city,
      district: data.district,
      postalCode: data.zip,
      latitude: data.lat,
      longitude: data.lon,
      timezone: data.timezone,
      utcOffset: data.offset,
      currency: data.currency,
      isp: data.isp,
      org: data.org,
      as: data.as,
      asName: data.asname,
      hostname,
      isMobile: data.mobile,
      isProxy: data.proxy,
      isHosting: data.hosting,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch IP information: ${message}` },
      { status: 500 },
    );
  }
}
