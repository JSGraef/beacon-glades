import { customAlphabet } from "nanoid";

// 8-char, lowercase + digits — easy to read in SMS, collision-resistant at 20 items/month.
const nano = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 8);

export function newSlug(): string {
  return nano();
}

export function itemBlobPath(slug: string): string {
  return `items/${slug}.json`;
}

export const ITEMS_PREFIX = "items/";
export const SETTINGS_PATH = "settings.json";
