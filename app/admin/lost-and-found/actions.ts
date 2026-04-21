"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-allowlist";
import {
  appendMessage,
  createItem,
  getItemBySlug,
  saveItem,
} from "@/lib/lost-and-found/items";
import { isContinentalUsE164, normalizeToE164 } from "@/lib/lost-and-found/phone";
import { getSettings, updateSettings } from "@/lib/lost-and-found/settings";
import {
  adminStatusUpdateSchema,
  newItemInputSchema,
  settingsInputSchema,
  type ItemStatus,
} from "@/lib/lost-and-found/types";
import { renderTemplate, sendSms } from "@/lib/lost-and-found/twilio";
import { getPublicItemUrl } from "@/lib/lost-and-found/urls";

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    throw new Error("Unauthorized");
  }
}

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export async function createItemAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const raw = {
    name: formData.get("name")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    notes: formData.get("notes")?.toString() ?? "",
  };

  const parsed = newItemInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const input = parsed.data;
  const settings = await getSettings();
  const submittedAt = new Date();
  const expiresAt = new Date(
    submittedAt.getTime() + settings.daysUntilExpiration * 24 * 60 * 60 * 1000,
  );

  const phoneE164 = normalizeToE164(input.phone ?? null);
  const reachable = phoneE164 !== null && isContinentalUsE164(phoneE164);
  const initialStatus: ItemStatus = reachable ? "active" : "donated";

  const item = await createItem({
    name: input.name,
    phoneE164,
    description: input.description,
    notes: input.notes ?? "",
    status: initialStatus,
    submittedAt,
    expiresAt,
  });

  if (reachable && phoneE164) {
    const body = renderTemplate(settings.defaultMessage, {
      name: item.name,
      link: getPublicItemUrl(item.slug),
    });
    try {
      const sent = await sendSms({ to: phoneE164, body });
      await appendMessage(
        item.slug,
        {
          direction: "outbound",
          body: sent.body,
          twilioSid: sent.sid,
          at: sent.sentAt,
        },
        { markUnread: false },
      );
    } catch (err) {
      console.error("[lost-and-found] failed to send SMS:", err);
    }
  }

  revalidatePath("/admin/lost-and-found");
  return { ok: true };
}

export async function updateItemStatusAction(
  slug: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const raw = {
    status: formData.get("status")?.toString() ?? "",
    notes: formData.get("notes")?.toString() ?? "",
  };

  const parsed = adminStatusUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const item = await getItemBySlug(slug);
  if (!item) {
    return { ok: false, error: "Item not found" };
  }

  await saveItem({
    ...item,
    status: parsed.data.status,
    notes: parsed.data.notes,
    hasUnreadReply: false,
  });

  revalidatePath("/admin/lost-and-found");
  return { ok: true };
}

export async function markReplyReadAction(slug: string): Promise<ActionResult> {
  await requireAdmin();

  const item = await getItemBySlug(slug);
  if (!item) {
    return { ok: false, error: "Item not found" };
  }
  if (!item.hasUnreadReply) {
    return { ok: true };
  }

  await saveItem({ ...item, hasUnreadReply: false });
  revalidatePath("/admin/lost-and-found");
  return { ok: true };
}

export async function updateSettingsAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const raw = {
    defaultMessage: formData.get("defaultMessage")?.toString() ?? "",
    daysUntilExpiration: formData.get("daysUntilExpiration")?.toString() ?? "",
  };

  const parsed = settingsInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid settings",
    };
  }

  await updateSettings(parsed.data);
  revalidatePath("/admin/settings");
  revalidatePath("/admin/lost-and-found");
  return { ok: true };
}
