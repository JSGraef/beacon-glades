import { getJson, putJson } from "@/lib/blob";

import {
  DEFAULT_NOTIFICATION,
  notificationSchema,
  type Notification,
  type NotificationInput,
} from "./types";

export const NOTIFICATION_PATH = "notification.json";

export async function getNotification(): Promise<Notification> {
  const raw = await getJson<unknown>(NOTIFICATION_PATH);
  if (!raw) {
    return DEFAULT_NOTIFICATION;
  }
  const parsed = notificationSchema.safeParse(raw);
  if (!parsed.success) {
    return DEFAULT_NOTIFICATION;
  }
  return parsed.data;
}

export async function updateNotification(
  input: NotificationInput,
): Promise<Notification> {
  const next: Notification = {
    message: input.message,
    visible: input.visible,
    updatedAt: new Date().toISOString(),
  };
  const parsed = notificationSchema.parse(next);
  await putJson(NOTIFICATION_PATH, parsed);
  return parsed;
}
