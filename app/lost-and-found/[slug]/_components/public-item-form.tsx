"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  PUBLIC_SELECTABLE_STATUSES,
  type PublicSelectableStatus,
} from "@/lib/lost-and-found/types";

const STATUS_META: Record<
  PublicSelectableStatus,
  { label: string; description: string }
> = {
  saving: {
    label: "Please save it",
    description: "We&apos;ll hold onto it for you.",
  },
  donated: {
    label: "Donate it",
    description: "Give it to another player.",
  },
  returned: {
    label: "Already picked up",
    description: "I have my disc back.",
  },
};

export function PublicItemForm({
  currentStatus,
  action,
}: {
  currentStatus: PublicSelectableStatus;
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [status, setStatus] = useState<PublicSelectableStatus>(currentStatus);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);
      if (result.ok) {
        toast.success("Thanks — we got it.");
        setSaved(true);
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  if (saved) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-sm">
        <p className="font-medium">Got it, thanks for letting us know.</p>
        <p className="mt-1 text-muted-foreground">
          You can update this page again at any time if your plans change.
        </p>
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={() => setSaved(false)}>
            Update again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">What should we do?</legend>
        {PUBLIC_SELECTABLE_STATUSES.map((s) => (
          <label
            key={s}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted",
              status === s && "border-primary ring-2 ring-primary/30",
            )}
          >
            <input
              type="radio"
              name="status"
              value={s}
              checked={status === s}
              onChange={() => setStatus(s)}
              className="mt-1"
            />
            <span className="flex flex-col">
              <span className="text-sm font-medium">{STATUS_META[s].label}</span>
              <span
                className="text-xs text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: STATUS_META[s].description }}
              />
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="public-notes">Anything we should know? (optional)</Label>
        <Textarea
          id="public-notes"
          name="notes"
          rows={3}
          maxLength={2000}
          placeholder="I can pick it up Saturday morning."
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send response"}
      </Button>
    </form>
  );
}
