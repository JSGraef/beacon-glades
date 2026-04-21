"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowDownLeftIcon, ArrowUpRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  formatAbsolute,
  formatRelative,
  STATUS_LABELS,
} from "@/lib/lost-and-found/display";
import { formatE164ForDisplay } from "@/lib/lost-and-found/phone";
import {
  ITEM_STATUSES,
  type Item,
  type ItemStatus,
} from "@/lib/lost-and-found/types";

import {
  markReplyReadAction,
  updateItemStatusAction,
} from "../actions";
import { StatusBadge } from "./status-badge";

export function ItemDetailSheet({
  item,
  open,
  onOpenChange,
}: {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<ItemStatus>("active");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (item) {
      setStatus(item.status);
      setNotes(item.notes);
    }
  }, [item]);

  useEffect(() => {
    if (!open || !item) {
      return;
    }
    if (!item.hasUnreadReply) {
      return;
    }
    void markReplyReadAction(item.slug);
  }, [open, item]);

  if (!item) {
    return null;
  }

  function onSave() {
    if (!item) {
      return;
    }
    const formData = new FormData();
    formData.set("status", status);
    formData.set("notes", notes);
    startTransition(async () => {
      const result = await updateItemStatusAction(item.slug, formData);
      if (result.ok) {
        toast.success("Saved");
        onOpenChange(false);
      } else {
        toast.error("Could not save", { description: result.error });
      }
    });
  }

  const phone = formatE164ForDisplay(item.phoneE164);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle>{item.name}</SheetTitle>
            <StatusBadge status={item.status} />
          </div>
          <SheetDescription>
            {phone ? phone : "No phone on file"} · submitted{" "}
            {formatRelative(item.submittedAt)}
            {item.status === "active" ? (
              <> · expires {formatRelative(item.expiresAt)}</>
            ) : null}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
          <section className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Description
            </span>
            <p className="text-sm">{item.description}</p>
          </section>

          <section className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Messages
            </span>
            {item.messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No messages yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {item.messages.map((m, idx) => (
                  <li
                    key={`${m.at}-${idx}`}
                    className={cn(
                      "flex flex-col gap-1 rounded-lg border border-border p-3",
                      m.direction === "inbound"
                        ? "bg-muted"
                        : "bg-background",
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {m.direction === "inbound" ? (
                        <>
                          <ArrowDownLeftIcon className="size-3" />
                          <span>From owner</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRightIcon className="size-3" />
                          <span>To owner</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{formatAbsolute(m.at)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{m.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <Label htmlFor="detail-status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as ItemStatus)}
            >
              <SelectTrigger id="detail-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEM_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <section className="flex flex-col gap-2">
            <Label htmlFor="detail-notes">Notes</Label>
            <Textarea
              id="detail-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={2000}
            />
          </section>
        </div>

        <SheetFooter>
          <div className="flex justify-end gap-2">
            <SheetClose asChild>
              <Button variant="outline" disabled={pending}>
                Cancel
              </Button>
            </SheetClose>
            <Button onClick={onSave} disabled={pending}>
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
