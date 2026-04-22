import { delJson, getJson, listPathnames, putJson } from "@/lib/blob";
import { newSlug } from "@/lib/lost-and-found/slug";

import {
  eventSchema,
  type Event,
  type EventInput,
} from "./types";

export const EVENTS_PREFIX = "events/";
const EVENT_TIMEZONE = "America/New_York";

export function eventBlobPath(slug: string): string {
  return `${EVENTS_PREFIX}${slug}.json`;
}

export function todayInEventTz(now: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(now);
}

export async function listEvents(): Promise<Event[]> {
  const paths = await listPathnames(EVENTS_PREFIX);
  const results = await Promise.all(
    paths
      .filter((p) => p.endsWith(".json"))
      .map(async (p) => {
        const raw = await getJson<unknown>(p);
        if (!raw) {
          return null;
        }
        const parsed = eventSchema.safeParse(raw);
        return parsed.success ? parsed.data : null;
      }),
  );
  return results
    .filter((v): v is Event => v !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function listUpcomingEvents(now: Date = new Date()): Promise<Event[]> {
  const today = todayInEventTz(now);
  const all = await listEvents();
  return all.filter((e) => e.date >= today);
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const raw = await getJson<unknown>(eventBlobPath(slug));
  if (!raw) {
    return null;
  }
  const parsed = eventSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function createEvent(input: EventInput): Promise<Event> {
  let slug = newSlug();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existing = await getEventBySlug(slug);
    if (!existing) {
      break;
    }
    slug = newSlug();
  }

  const now = new Date().toISOString();
  const event: Event = {
    id: slug,
    slug,
    title: input.title,
    description: input.description,
    date: input.date,
    linkUrl: input.linkUrl,
    linkLabel: input.linkLabel,
    createdAt: now,
    updatedAt: now,
  };
  const parsed = eventSchema.parse(event);
  await putJson(eventBlobPath(parsed.slug), parsed);
  return parsed;
}

export async function updateEvent(
  slug: string,
  input: EventInput,
): Promise<Event | null> {
  const existing = await getEventBySlug(slug);
  if (!existing) {
    return null;
  }
  const next: Event = {
    ...existing,
    title: input.title,
    description: input.description,
    date: input.date,
    linkUrl: input.linkUrl,
    linkLabel: input.linkLabel,
    updatedAt: new Date().toISOString(),
  };
  const parsed = eventSchema.parse(next);
  await putJson(eventBlobPath(parsed.slug), parsed);
  return parsed;
}

export async function deleteEvent(slug: string): Promise<void> {
  await delJson(eventBlobPath(slug));
}
