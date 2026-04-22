"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-allowlist";
import {
  createEvent,
  deleteEvent,
  getEventBySlug,
  updateEvent,
} from "@/lib/homepage/events";
import { updateNotification } from "@/lib/homepage/notification";
import {
  eventInputSchema,
  notificationInputSchema,
} from "@/lib/homepage/types";

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    throw new Error("Unauthorized");
  }
}

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

function readEventFormData(formData: FormData) {
  return {
    title: formData.get("title")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    date: formData.get("date")?.toString() ?? "",
    linkUrl: formData.get("linkUrl")?.toString() ?? "",
    linkLabel: formData.get("linkLabel")?.toString() ?? "",
  };
}

function revalidateHomepageSurfaces() {
  revalidatePath("/");
}

export async function updateNotificationAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const raw = {
    message: formData.get("message")?.toString() ?? "",
    visible: formData.get("visible") === "on" || formData.get("visible") === "true",
  };

  const parsed = notificationInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid notification",
    };
  }

  const sanitized = {
    message: parsed.data.message,
    visible: parsed.data.visible && parsed.data.message.trim().length > 0,
  };

  await updateNotification(sanitized);

  revalidateHomepageSurfaces();
  revalidatePath("/admin");
  return { ok: true };
}

export async function createEventAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = eventInputSchema.safeParse(readEventFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid event",
    };
  }

  await createEvent(parsed.data);

  revalidateHomepageSurfaces();
  revalidatePath("/admin/events");
  return { ok: true };
}

export async function updateEventAction(
  slug: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = eventInputSchema.safeParse(readEventFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid event",
    };
  }

  const existing = await getEventBySlug(slug);
  if (!existing) {
    return { ok: false, error: "Event not found" };
  }

  await updateEvent(slug, parsed.data);

  revalidateHomepageSurfaces();
  revalidatePath("/admin/events");
  return { ok: true };
}

export async function deleteEventAction(slug: string): Promise<ActionResult> {
  await requireAdmin();

  const existing = await getEventBySlug(slug);
  if (!existing) {
    return { ok: true };
  }

  await deleteEvent(slug);

  revalidateHomepageSurfaces();
  revalidatePath("/admin/events");
  return { ok: true };
}
