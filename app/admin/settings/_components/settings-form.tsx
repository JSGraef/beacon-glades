"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Settings } from "@/lib/lost-and-found/types";

import { updateSettingsAction } from "../../lost-and-found/actions";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [pending, startTransition] = useTransition();
  const [defaultMessage, setDefaultMessage] = useState(settings.defaultMessage);
  const [days, setDays] = useState(String(settings.daysUntilExpiration));

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateSettingsAction(formData);
      if (result.ok) {
        toast.success("Settings saved");
      } else {
        toast.error("Could not save settings", { description: result.error });
      }
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Outbound SMS template</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Label htmlFor="defaultMessage" className="sr-only">
            Default message
          </Label>
          <Textarea
            id="defaultMessage"
            name="defaultMessage"
            rows={5}
            maxLength={1000}
            value={defaultMessage}
            onChange={(e) => setDefaultMessage(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Use <code className="rounded bg-muted px-1">{"{name}"}</code> for
            the owner&apos;s name and{" "}
            <code className="rounded bg-muted px-1">{"{link}"}</code> for the
            self-serve link. Both are replaced at send time.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expiration</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Label htmlFor="daysUntilExpiration">
            Days until an active item expires
          </Label>
          <Input
            id="daysUntilExpiration"
            name="daysUntilExpiration"
            type="number"
            min={1}
            max={365}
            step={1}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            A daily cron marks any active item past this age as Expired. Items
            already in Saving / Donated / Returned stay put.
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save settings"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
