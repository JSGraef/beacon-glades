import type { ItemStatus } from "./types";

export const STATUS_LABELS: Record<ItemStatus, string> = {
  active: "Active",
  saving: "Saving",
  expired: "Expired",
  donated: "Donated",
  returned: "Returned",
};

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

export const STATUS_BADGE_VARIANT: Record<ItemStatus, BadgeVariant> = {
  active: "default",
  saving: "secondary",
  expired: "outline",
  donated: "outline",
  returned: "secondary",
};

export function formatRelative(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const diffMs = date.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (absMs < hour) {
    return rtf.format(Math.round(diffMs / minute), "minute");
  }
  if (absMs < day) {
    return rtf.format(Math.round(diffMs / hour), "hour");
  }
  if (absMs < 30 * day) {
    return rtf.format(Math.round(diffMs / day), "day");
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatAbsolute(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
