/**
 * PM2.5 History Logger
 * Maintains persistent history of readings seeded with existing aqi_log.csv data.
 */

const STORAGE_KEY = 'airguardian_pm25_history_v1';

// Seeded with real historical records from project's aqi_log.csv
const INITIAL_SEED_LOG = [
  { date_utc: '2025-07-10T17:21:42Z', pm25: 24.54 },
  { date_utc: '2025-07-10T17:36:37Z', pm25: 26.34 },
  { date_utc: '2025-07-11T06:35:09Z', pm25: 12.60 },
  { date_utc: '2025-07-12T14:23:48Z', pm25: 18.93 },
  { date_utc: '2025-07-12T14:53:42Z', pm25: 20.94 },
  { date_utc: '2025-07-12T16:13:47Z', pm25: 22.43 },
  { date_utc: '2025-07-14T02:25:11Z', pm25: 28.31 },
  { date_utc: '2025-07-15T07:32:07Z', pm25: 18.19 },
  { date_utc: '2025-07-15T07:32:16Z', pm25: 5.57 },
  { date_utc: '2026-03-19T16:13:56Z', pm25: 30.24 },
  { date_utc: '2026-03-19T16:14:45Z', pm25: 1.25 },
  { date_utc: '2026-03-19T16:33:11Z', pm25: 1.23 },
  { date_utc: '2026-03-19T16:34:25Z', pm25: 31.86 },
  { date_utc: '2026-03-19T16:34:36Z', pm25: 31.86 },
  { date_utc: '2026-06-13T18:46:25Z', pm25: 63.69 },
  { date_utc: '2026-06-13T18:51:14Z', pm25: 38.84 },
  { date_utc: '2026-06-14T13:00:15Z', pm25: 10.58 },
  { date_utc: '2026-06-14T13:02:57Z', pm25: 13.35 },
  { date_utc: '2026-06-14T13:03:04Z', pm25: 13.35 },
  { date_utc: '2026-06-14T13:03:07Z', pm25: 2.97 },
  { date_utc: '2026-06-14T13:03:55Z', pm25: 27.39 },
  { date_utc: '2026-06-15T06:01:07Z', pm25: 7.06 },
  { date_utc: '2026-06-15T06:09:28Z', pm25: 7.06 },
  { date_utc: '2026-11-17T08:04:49Z', pm25: 30.35 }
];

export function getLoggedReadings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_LOG));
      return INITIAL_SEED_LOG;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SEED_LOG;
  } catch (err) {
    console.error('Failed to load history log:', err);
    return INITIAL_SEED_LOG;
  }
}

export function logReading(pm25, timestampMs = Date.now()) {
  if (pm25 == null || isNaN(pm25)) return;
  try {
    const currentList = getLoggedReadings();
    const dateIso = new Date(timestampMs).toISOString();

    // Check if the last reading was logged within the last 5 minutes with identical value to avoid flooding
    const lastItem = currentList[currentList.length - 1];
    if (lastItem) {
      const lastTime = new Date(lastItem.date_utc).getTime();
      if (Math.abs(timestampMs - lastTime) < 5 * 60 * 1000 && Math.abs(lastItem.pm25 - pm25) < 0.1) {
        return; // skip duplicate rapid log
      }
    }

    const updated = [...currentList, { date_utc: dateIso, pm25: Number(Number(pm25).toFixed(2)) }];
    // Keep up to 200 items
    const trimmed = updated.slice(-200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to log reading:', err);
  }
}

export function getFilteredHistory(days = 7) {
  const readings = getLoggedReadings();
  const now = Date.now();
  const cutoff = now - days * 24 * 3600 * 1000;

  // Filter and map
  let filtered = readings.filter(r => {
    const time = new Date(r.date_utc).getTime();
    return !isNaN(time) && (days === 0 || time >= cutoff);
  });

  // If filtered is too small (e.g., app run on fresh machine where cutoff is strict), fallback to last 15 entries
  if (filtered.length < 5) {
    filtered = readings.slice(-15);
  }

  return filtered.map(r => ({
    date: new Date(r.date_utc),
    formattedDate: new Date(r.date_utc).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    formattedTime: new Date(r.date_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    pm25: r.pm25,
  }));
}
