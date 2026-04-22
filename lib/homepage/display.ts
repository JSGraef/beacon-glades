const EVENT_TIMEZONE = "America/New_York";

function parseIsoDate(date: string): Date {
  return new Date(`${date}T12:00:00Z`);
}

export function formatEventShort(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIMEZONE,
    month: "short",
    day: "numeric",
  }).format(parseIsoDate(date));
}

export function formatEventLong(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIMEZONE,
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parseIsoDate(date));
}

export function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
