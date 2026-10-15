import type { Request, Response } from 'express';

export interface PublicHoliday {
  date: string; // YYYY-MM-DD
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

export interface HolidayApiResponse {
  year: number;
  countryCode: string;
  count: number;
  holidays: PublicHoliday[];
  cachedAt?: string;
  source: string;
}

// In-memory cache to prevent excessive requests to external Nager.Date API
const cache: { [key: string]: { data: PublicHoliday[]; timestamp: number } } = {};
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

// Reliable fallback for 2026 SG in case external network is offline
const FALLBACK_2026_SG_HOLIDAYS: PublicHoliday[] = [
  { date: '2026-01-01', localName: "New Year's Day", name: "New Year's Day", countryCode: 'SG', fixed: false, global: true, counties: null, launchYear: null, types: ['Public'] },
  { date: '2026-02-17', localName: 'Chinese New Year', name: 'Chinese New Year', countryCode: 'SG', fixed: false, global: true, counties: null, launchYear: null, types: ['Public'] },
  { date: '2026-02-18', localName: 'Chinese New Year', name: 'Chinese New Year', countryCode: 'SG', fixed: false, global: true, counties: null, launchYear: null, types: ['Public'] },
  { date: '2026-03-21', localName: 'Hari Raya Puasa', name: 'Hari Raya Puasa', countryCode: 'SG', fixed: false, global: true, counties: null, launchYear: null, types: ['Public'] },
  { date: '2026-04-03', localName: 'Good Friday', name: 'Good Friday', countryCode: 'SG', fixed: false, global: true, counties: null, launchYear: null, types: ['Public'] },
  { date: '2026-05-01', localName: 'Labour Day', name: 'Labour Day', countryCode: 'SG', fixed: false, global: true, counties: null, launchYear: null, types: ['Public'] },
  { date: '2026-05-27', localName: 'Hari Raya Haji', name: 'Hari Raya Haji', countryCode: 'SG', fixed: false, global: true, counties: null, launchYear: null, types: ['Public'] },
  { date: '2026-06-01', localName: 'Vesak Day', name: 'Vesak Day', countryCode: 'SG', fixed: false, global: true, counties: null, launchYear: null, types: ['Public'] },
  { date: '2026-08-10', localName: 'National Day', name: 'National Day', countryCode: 'SG', fixed: false, global: true, counties: null, launchYear: null, types: ['Public'] },
  { date: '2026-11-09', localName: 'Deepavali', name: 'Deepavali', countryCode: 'SG', fixed: false, global: true, counties: null, launchYear: null, types: ['Public'] },
  { date: '2026-12-25', localName: 'Christmas Day', name: 'Christmas Day', countryCode: 'SG', fixed: false, global: true, counties: null, launchYear: null, types: ['Public'] },
];

export async function fetchNagerPublicHolidays(
  year: number = 2026,
  countryCode: string = 'SG'
): Promise<{ holidays: PublicHoliday[]; source: string }> {
  const cacheKey = `${year}_${countryCode}`;
  const now = Date.now();

  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_TTL_MS) {
    return { holidays: cache[cacheKey].data, source: 'cache' };
  }

  const endpoint = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ShiftPulse-Scheduler/1.0',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Nager.Date responded with status ${res.status}`);
    }

    const data: PublicHoliday[] = await res.json();
    cache[cacheKey] = { data, timestamp: now };
    return { holidays: data, source: endpoint };
  } catch (err) {
    console.warn(`[Nager.Date Error] Falling back to preloaded 2026 SG holidays:`, err);
    if (year === 2026 && countryCode.toUpperCase() === 'SG') {
      return { holidays: FALLBACK_2026_SG_HOLIDAYS, source: 'fallback_offline' };
    }
    return { holidays: [], source: 'error_fallback' };
  }
}

export async function holidayHandler(req?: Request | any, res?: Response | any) {
  try {
    const year = parseInt((req?.query?.year as string) || '2026', 10);
    const country = ((req?.query?.country as string) || 'SG').toUpperCase();

    const result = await fetchNagerPublicHolidays(year, country);

    const payload: HolidayApiResponse = {
      year,
      countryCode: country,
      count: result.holidays.length,
      holidays: result.holidays,
      source: result.source,
      cachedAt: new Date().toISOString(),
    };

    if (res && typeof res.status === 'function') {
      return res.status(200).json(payload);
    }
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    const errPayload = {
      error: error?.message || 'Failed to fetch public holidays',
      year: 2026,
      countryCode: 'SG',
      holidays: FALLBACK_2026_SG_HOLIDAYS,
      source: 'fallback_error',
    };

    if (res && typeof res.status === 'function') {
      return res.status(500).json(errPayload);
    }
    return new Response(JSON.stringify(errPayload), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default holidayHandler;
