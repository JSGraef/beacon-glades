import { listEvents, todayInEventTz } from "@/lib/homepage/events";

import { EventsManager } from "./_components/events-manager";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await listEvents();
  const today = todayInEventTz();

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Events</h1>
        <p className="text-sm text-muted-foreground">
          Upcoming events are shown on the homepage. Past events stay here for
          reference and can be edited or removed.
        </p>
      </header>
      <EventsManager initialEvents={events} today={today} />
    </section>
  );
}
