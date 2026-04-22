"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Notification } from "@/lib/homepage/types";

import { updateNotificationAction } from "../homepage/actions";

export function NotificationForm({ notification }: { notification: Notification }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState(notification.message);
  const [visible, setVisible] = useState(notification.visible);

  function onSubmit() {
    const formData = new FormData();
    formData.set("message", message);
    formData.set("visible", visible ? "true" : "false");

    startTransition(async () => {
      const result = await updateNotificationAction(formData);
      if (result.ok) {
        toast.success("Notification saved", {
          description: visible && message.trim()
            ? "Banner is live on the homepage."
            : "Banner is hidden on the homepage.",
        });
      } else {
        toast.error("Could not save notification", { description: result.error });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Homepage banner</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="notification-message">Message</Label>
          <Textarea
            id="notification-message"
            rows={3}
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Course closed Sat 11/2 due to maintenance"
          />
          <p className="text-xs text-muted-foreground">
            Shown in a narrow bar at the top of the homepage. Keep it short.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
          <div className="flex flex-col">
            <Label htmlFor="notification-visible" className="font-medium">
              Show on homepage
            </Label>
            <span className="text-xs text-muted-foreground">
              When off, the banner is hidden regardless of message contents.
            </span>
          </div>
          <Switch
            id="notification-visible"
            checked={visible}
            onCheckedChange={setVisible}
          />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={onSubmit} disabled={pending}>
          {pending ? "Saving..." : "Save banner"}
        </Button>
      </CardFooter>
    </Card>
  );
}
