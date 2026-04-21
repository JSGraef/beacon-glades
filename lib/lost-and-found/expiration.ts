import { listItems, saveItem } from "./items";

export type ExpirationResult = {
  scanned: number;
  expired: number;
  expiredSlugs: string[];
};

export async function expireOverdueItems(now: Date = new Date()): Promise<ExpirationResult> {
  const items = await listItems();
  const nowIso = now.toISOString();
  const toExpire = items.filter(
    (item) => item.status === "active" && item.expiresAt <= nowIso,
  );

  await Promise.all(
    toExpire.map((item) => saveItem({ ...item, status: "expired" })),
  );

  return {
    scanned: items.length,
    expired: toExpire.length,
    expiredSlugs: toExpire.map((i) => i.slug),
  };
}
