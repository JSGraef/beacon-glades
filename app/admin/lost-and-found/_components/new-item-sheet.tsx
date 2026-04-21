"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import { createItemAction } from "../actions";

export function NewItemSheet({
  open,
  onOpenChange,
  daysUntilExpiration,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  daysUntilExpiration: number;
}) {
  const [pending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createItemAction(formData);
      if (result.ok) {
        toast.success("Item added", {
          description: "SMS sent if a reachable phone number was provided.",
        });
        setFormKey((k) => k + 1);
        onOpenChange(false);
      } else {
        toast.error("Could not add item", { description: result.error });
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New lost-and-found entry</SheetTitle>
          <SheetDescription>
            If a phone is provided, we&apos;ll text the owner using the default
            message and auto-expire the item in {daysUntilExpiration} days.
          </SheetDescription>
        </SheetHeader>
        <form
          key={formKey}
          action={onSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-name">Owner name</Label>
            <Input
              id="new-name"
              name="name"
              required
              maxLength={120}
              placeholder="Jane Doe"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-phone">Phone (optional)</Label>
            <Input
              id="new-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="(555) 123-4567"
            />
            <p className="text-xs text-muted-foreground">
              If empty or non-continental US, the item is marked Donated and no
              SMS is sent.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-description">Disc description</Label>
            <Textarea
              id="new-description"
              name="description"
              required
              maxLength={500}
              rows={3}
              placeholder="Pink Innova Destroyer, initials JD on the back"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-notes">Internal notes (optional)</Label>
            <Textarea
              id="new-notes"
              name="notes"
              maxLength={2000}
              rows={3}
              placeholder="Found by hole 7, left in the clubhouse bin."
            />
          </div>
          <SheetFooter className="mt-auto p-0">
            <div className="flex justify-end gap-2">
              <SheetClose asChild>
                <Button type="button" variant="outline" disabled={pending}>
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Add entry"}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
