import { z } from "zod";

export const notificationSchema = z.object({
  message: z.string(),
  visible: z.boolean(),
  updatedAt: z.string(),
});

export type Notification = z.infer<typeof notificationSchema>;

export const DEFAULT_NOTIFICATION: Notification = {
  message: "",
  visible: false,
  updatedAt: new Date(0).toISOString(),
};

export const notificationInputSchema = z.object({
  message: z
    .string()
    .trim()
    .max(500, "Message must be 500 characters or fewer"),
  visible: z.boolean(),
});

export type NotificationInput = z.infer<typeof notificationInputSchema>;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const eventSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  date: z.string().regex(ISO_DATE_RE),
  linkUrl: z.string().nullable(),
  linkLabel: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Event = z.infer<typeof eventSchema>;

const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

export const eventInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().min(1, "Description is required").max(2000),
  date: z
    .string()
    .trim()
    .regex(ISO_DATE_RE, "Date must be in YYYY-MM-DD format"),
  linkUrl: z.preprocess(
    emptyToNull,
    z
      .url("Link must be a valid URL")
      .refine((v) => v.startsWith("https://"), "Link must start with https://")
      .nullable(),
  ),
  linkLabel: z.preprocess(
    emptyToNull,
    z.string().trim().min(1).max(60).nullable(),
  ),
});

export type EventInput = z.infer<typeof eventInputSchema>;
