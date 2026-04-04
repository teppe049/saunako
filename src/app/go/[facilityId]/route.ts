import { NextRequest, NextResponse } from 'next/server';
import { getFacilityById } from '@/lib/facilities';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ facilityId: string }> }
) {
  const { facilityId } = await params;
  const id = parseInt(facilityId, 10);

  if (isNaN(id)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const facility = getFacilityById(id);
  if (!facility) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const dest = request.nextUrl.searchParams.get('dest');
  let targetUrlString: string | null = null;

  if (dest === 'booking' && facility.bookingUrl) {
    targetUrlString = facility.bookingUrl;
  } else {
    targetUrlString = facility.website;
  }

  if (
    !targetUrlString ||
    (!targetUrlString.startsWith('https://') &&
      !targetUrlString.startsWith('http://'))
  ) {
    return NextResponse.redirect(
      new URL(`/facilities/${id}`, request.url)
    );
  }

  const targetUrl = new URL(targetUrlString);
  targetUrl.searchParams.set('utm_source', 'saunako');
  targetUrl.searchParams.set('utm_medium', 'referral');
  targetUrl.searchParams.set('utm_campaign', `facility_${id}`);

  return NextResponse.redirect(targetUrl.toString(), 302);
}
