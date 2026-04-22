"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CalendarIcon, ExternalLinkIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatEventLong, hostnameOf } from "@/lib/homepage/display";
import type { Event } from "@/lib/homepage/types";

import {
  createEventAction,
  deleteEventAction,
  updateEventAction,
} from "../../homepage/actions";

type FormMode =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; slug: string };

export function EventsManager({
  initialEvents,
  today,
}: {
  initialEvents: Event[];
  today: string;
}) {
  const [mode, setMode] = useState<FormMode>({ kind: "closed" });

  const { upcoming, past } = useMemo(() => {
    const upcomingList: Event[] = [];
    const pastList: Event[] = [];
    for (const event of initialEvents) {
      if (event.date >= today) {
        upcomingList.push(event);
      } else {
        pastList.push(event);
      }
    }
    upcomingList.sort((a, b) => a.date.localeCompare(b.date));
    pastList.sort((a, b) => b.date.localeCompare(a.date));
    return { upcoming: upcomingList, past: pastList };
  }, [initialEvents, today]);

  const editingEvent =
    mode.kind === "edit"
      ? initialEvents.find((e) => e.slug === mode.slug) ?? null
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        {mode.kind === "closed" ? (
          <Button onClick={() => setMode({ kind: "create" })}>
            <PlusIcon />
            <span>New event</span>
          </Button>
        ) : null}
      </div>

      {mode.kind === "create" ? (
        <EventFormCard
          key="create"
          title="New event"
          initial={null}
          onCancel={() => setMode({ kind: "closed" })}
          onSaved={() => setMode({ kind: "closed" })}
        />
      ) : null}

      {mode.kind === "edit" && editingEvent ? (
        <EventFormCard
          key={`edit-${editingEvent.slug}`}
          title="Edit event"
          initial={editingEvent}
          onCancel={() => setMode({ kind: "closed" })}
          onSaved={() => setMode({ kind: "closed" })}
        />
      ) : null}

      <EventsGroup
        heading="Upcoming"
        events={upcoming}
        emptyMessage="No upcoming events. Add one with the button above."
        onEdit={(slug) => setMode({ kind: "edit", slug })}
      />

      <EventsGroup
        heading="Past"
        events={past}
        emptyMessage="No past events yet."
        onEdit={(slug) => setMode({ kind: "edit", slug })}
        muted
      />
    </div>
  );
}

function EventsGroup({
  heading,
  events,
  emptyMessage,
  onEdit,
  muted = false,
}: {
  heading: string;
  events: Event[];
  emptyMessage: string;
  onEdit: (slug: string) => void;
  muted?: boolean;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {heading}
        </h2>
        <span className="text-xs text-muted-foreground">({events.length})</span>
      </div>
      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((event) => (
            <li key={event.slug}>
              <EventRow event={event} onEdit={() => onEdit(event.slug)} muted={muted} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EventRow({
  event,
  onEdit,
  muted,
}: {
  event: Event;
  onEdit: () => void;
  muted: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const host = event.linkUrl ? hostnameOf(event.linkUrl) : null;

  function onDelete() {
    const confirmed = window.confirm(
      `Delete "${event.title}"? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }
    startTransition(async () => {
      const result = await deleteEventAction(event.slug);
      if (result.ok) {
        toast.success("Event deleted");
      } else {
        toast.error("Could not delete event", { description: result.error });
      }
    });
  }

  return (
    <div
      className={
        "flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between" +
        (muted ? " opacity-80" : "")
      }
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <CalendarIcon className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-sm font-medium text-muted-foreground">
            {formatEventLong(event.date)}
          </span>
        </div>
        <h3 className="text-lg font-semibold tracking-tight">{event.title}</h3>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {event.description}
        </p>
        {event.linkUrl ? (
          <Link
            href={event.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex w-fit items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
          >
            <ExternalLinkIcon className="size-3.5" />
            <span>{event.linkLabel ?? host ?? "Details"}</span>
            {host && event.linkLabel ? (
              <span className="text-muted-foreground">· {host}</span>
            ) : null}
          </Link>
        ) : null}
      </div>
      <div className="flex shrink-0 gap-2 sm:flex-col sm:items-end">
        <Button variant="outline" size="sm" onClick={onEdit} disabled={pending}>
          <PencilIcon />
          <span>Edit</span>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={pending}
        >
          <Trash2Icon />
          <span>{pending ? "Deleting..." : "Delete"}</span>
        </Button>
      </div>
    </div>
  );
}

function EventFormCard({
  title,
  initial,
  onCancel,
  onSaved,
}: {
  title: string;
  initial: Event | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [formTitle, setFormTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? "");
  const [linkLabel, setLinkLabel] = useState(initial?.linkLabel ?? "");

  function onSubmit() {
    const formData = new FormData();
    formData.set("title", formTitle);
    formData.set("description", description);
    formData.set("date", date);
    formData.set("linkUrl", linkUrl);
    formData.set("linkLabel", linkLabel);

    startTransition(async () => {
      const result = initial
        ? await updateEventAction(initial.slug, formData)
        : await createEventAction(formData);

      if (result.ok) {
        toast.success(initial ? "Event updated" : "Event created");
        onSaved();
      } else {
        toast.error(
          initial ? "Could not update event" : "Could not create event",
          { description: result.error },
        );
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
              maxLength={120}
              placeholder="Fall Doubles League Kickoff"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="event-date">Date</Label>
            <Input
              id="event-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-fit"
            />
            <p className="text-xs text-muted-foreground">
              Displayed and filtered in America/New_York.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              maxLength={2000}
              placeholder="Meet at the clubhouse by 5:30pm. $5 entry, random doubles, CTPs for closest to pin."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-link-url">Link URL (optional)</Label>
              <Input
                id="event-link-url"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com/event"
                pattern="https://.*"
              />
              <p className="text-xs text-muted-foreground">Must start with https://</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-link-label">Link label (optional)</Label>
              <Input
                id="event-link-label"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                maxLength={60}
                placeholder="RSVP"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? initial
                  ? "Saving..."
                  : "Creating..."
                : initial
                  ? "Save changes"
                  : "Create event"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
