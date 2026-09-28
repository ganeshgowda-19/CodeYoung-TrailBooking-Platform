import { Request, Response } from 'express';
import { DateTime } from 'luxon';

const SUPPORTED_TIMEZONES = [
  { identifier: 'Asia/Kolkata', name: 'India Standard Time (IST)', region: 'Asia' },
  { identifier: 'America/New_York', name: 'Eastern Time (US & Canada)', region: 'Americas' },
  { identifier: 'America/Chicago', name: 'Central Time (US & Canada)', region: 'Americas' },
  { identifier: 'America/Denver', name: 'Mountain Time (US & Canada)', region: 'Americas' },
  { identifier: 'America/Los_Angeles', name: 'Pacific Time (US & Canada)', region: 'Americas' },
  { identifier: 'Europe/London', name: 'Greenwich Mean Time / BST (London)', region: 'Europe' },
  { identifier: 'Europe/Paris', name: 'Central European Time (Paris)', region: 'Europe' },
  { identifier: 'Asia/Dubai', name: 'Gulf Standard Time (Dubai)', region: 'Asia' },
  { identifier: 'Asia/Singapore', name: 'Singapore Standard Time', region: 'Asia' },
  { identifier: 'Australia/Sydney', name: 'Australian Eastern Time (Sydney)', region: 'Australia' },
];

export async function getTimezones(_req: Request, res: Response) {
  const now = DateTime.now();

  const formattedTimezones = SUPPORTED_TIMEZONES.map((tz) => {
    const zonedTime = now.setZone(tz.identifier);
    const isInDst = zonedTime.isInDST;
    const dstStatus = isInDst ? '☀️ Daylight Saving Time Active' : '❄️ Standard Time';

    return {
      identifier: tz.identifier,
      name: tz.name,
      region: tz.region,
      abbr: zonedTime.offsetNameShort,
      formattedOffset: `UTC${zonedTime.toFormat('ZZ')}`,
      currentTimeDisplay: `${zonedTime.toFormat('h:mm a')} (${zonedTime.offsetNameShort})`,
      isInDst,
      dstStatus,
    };
  });

  return res.status(200).json({
    success: true,
    data: formattedTimezones,
    error: null,
  });
}
