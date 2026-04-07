import { NextRequest, NextResponse } from 'next/server';
import { promises as dnsPromises } from 'dns';

function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();

  return '';
}

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);

  const fields =
    'status,message,continent,continentCode,country,countryCode,regionName,region,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query';

  const url = clientIp
    ? `http://ip-api.com/json/${clientIp}?fields=${fields}`
    : `http://ip-api.com/json/?fields=${fields}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`ip-api.com responded with ${response.status}`);
    }

    const data = await response.json();

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
    return NextResponse.json({ error: `Failed to fetch IP information: ${message}` }, { status: 500 });
  }
}
