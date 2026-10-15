import { PublicHoliday } from '../types';

export interface HolidayFetchResult {
  holidays: PublicHoliday[];
  source: string;
  count: number;
}

export async function getPublicHolidays(
  year: number = 2026,
  country: string = 'SG'
): Promise<HolidayFetchResult> {
  // First, attempt to call the serverless API endpoint
  try {
    const res = await fetch(`/api/holiday?year=${year}&country=${country}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.holidays) && data.holidays.length > 0) {
        return {
          holidays: data.holidays,
          source: data.source || 'ShiftPulse /api/holiday',
          count: data.holidays.length,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch from internal /api/holiday, trying direct Nager.Date fallback:', err);
  }

  // Direct client fallback to Nager.Date API
  try {
    const directRes = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`);
    if (directRes.ok) {
      const list: PublicHoliday[] = await directRes.json();
      return {
        holidays: list,
        source: `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`,
        count: list.length,
      };
    }
  } catch (err) {
    console.warn('Direct Nager.Date fetch failed, using fallback list:', err);
  }

  // Offline fallback
  const fallbackHolidays: PublicHoliday[] = [
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

  return {
    holidays: fallbackHolidays,
    source: 'offline_preset',
    count: fallbackHolidays.length,
  };
}

export function findHolidayForDate(
  dateStr: string,
  holidays: PublicHoliday[]
): PublicHoliday | undefined {
  return holidays.find((h) => h.date === dateStr);
}
