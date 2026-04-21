import { z } from "zod";

export const ITEM_STATUSES = [
  "active",
  "saving",
  "expired",
  "donated",
  "returned",
] as const;

export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const PUBLIC_SELECTABLE_STATUSES = ["saving", "donated", "returned"] as const satisfies readonly ItemStatus[];
export type PublicSelectableStatus = (typeof PUBLIC_SELECTABLE_STATUSES)[number];

export const MESSAGE_DIRECTIONS = ["outbound", "inbound"] as const;
export type MessageDirection = (typeof MESSAGE_DIRECTIONS)[number];

export const messageSchema = z.object({
  direction: z.enum(MESSAGE_DIRECTIONS),
  body: z.string(),
  twilioSid: z.string().nullable(),
  at: z.string(),
});

export type ItemMessage = z.infer<typeof messageSchema>;

export const itemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  phoneE164: z.string().nullable(),
  description: z.string(),
  notes: z.string(),
  status: z.enum(ITEM_STATUSES),
  hasUnreadReply: z.boolean(),
  submittedAt: z.string(),
  expiresAt: z.string(),
  updatedAt: z.string(),
  messages: z.array(messageSchema),
});

export type Item = z.infer<typeof itemSchema>;

export const settingsSchema = z.object({
  defaultMessage: z.string().min(1),
  daysUntilExpiration: z.number().int().positive(),
});

export type Settings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: Settings = {
  defaultMessage:
    "Hi {name}, Beacon Glades Disc Golf here — we found your disc. Let us know what you'd like to do: {link}",
  daysUntilExpiration: 30,
};

export const newItemInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z
    .string()
    .trim()
    .max(32)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  description: z.string().trim().min(1, "Description is required").max(500),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v === undefined || v === "" ? "" : v)),
});

export type NewItemInput = z.infer<typeof newItemInputSchema>;

export const publicUpdateInputSchema = z.object({
  status: z.enum(PUBLIC_SELECTABLE_STATUSES),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v === undefined || v === "" ? "" : v)),
});

export type PublicUpdateInput = z.infer<typeof publicUpdateInputSchema>;

export const adminStatusUpdateSchema = z.object({
  status: z.enum(ITEM_STATUSES),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v === undefined ? "" : v)),
});

export type AdminStatusUpdate = z.infer<typeof adminStatusUpdateSchema>;

export const settingsInputSchema = z.object({
  defaultMessage: z.string().trim().min(1, "Default message is required").max(1000),
  daysUntilExpiration: z.coerce
    .number()
    .int("Days must be a whole number")
    .positive("Days must be greater than 0")
    .max(365, "Max 365 days"),
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;
