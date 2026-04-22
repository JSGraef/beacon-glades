import { ArrowUpRight, CalendarDays } from "lucide-react";

import { formatEventLong, formatEventShort, hostnameOf } from "@/lib/homepage/display";
import type { Event } from "@/lib/homepage/types";

export function EventsSection({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-6 mb-16">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-start gap-3">
          <div className="text-tertiary">
            <CalendarDays className="w-10 h-10" aria-hidden />
          </div>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface tracking-tight">
            Upcoming events
          </h2>
        </div>

        <ul className="flex flex-col border-t border-on-surface/10">
          {events.map((event) => (
            <li key={event.slug} className="border-b border-on-surface/10">
              <EventRow event={event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function EventRow({ event }: { event: Event }) {
  const host = event.linkUrl ? hostnameOf(event.linkUrl) : null;
  const linkLabel = event.linkLabel ?? (host ? "Details" : null);
  const [shortMonth, shortDay] = formatEventShort(event.date).split(" ");

  return (
    <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-baseline sm:gap-8">
      <time
        dateTime={event.date}
        className="flex shrink-0 items-baseline gap-2 sm:w-36"
      >
        <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
          {shortMonth}
        </span>
        <span className="font-headline text-3xl font-bold leading-none text-on-surface">
          {shortDay}
        </span>
        <span className="sr-only">{formatEventLong(event.date)}</span>
      </time>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <h3 className="font-headline text-xl font-bold tracking-tight text-on-surface">
            {event.title}
          </h3>
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
            {formatEventLong(event.date)}
          </span>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
          {event.description}
        </p>

        {event.linkUrl && linkLabel ? (
          <a
            href={event.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary underline underline-offset-4"
          >
            <span>{linkLabel}</span>
            {host && event.linkLabel ? (
              <span className="font-normal text-on-surface-variant no-underline">· {host}</span>
            ) : null}
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
        ) : null}
      </div>
    </div>
  );
}
