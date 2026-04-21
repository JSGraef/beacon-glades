import { getJson, listPathnames, putJson } from "./storage";
import { ITEMS_PREFIX, itemBlobPath, newSlug } from "./slug";
import {
  itemSchema,
  type Item,
  type ItemMessage,
  type ItemStatus,
} from "./types";

export async function listItems(): Promise<Item[]> {
  const paths = await listPathnames(ITEMS_PREFIX);
  const results = await Promise.all(
    paths
      .filter((p) => p.endsWith(".json"))
      .map(async (p) => {
        const raw = await getJson<unknown>(p);
        if (!raw) {
          return null;
        }
        const parsed = itemSchema.safeParse(raw);
        return parsed.success ? parsed.data : null;
      }),
  );
  return results
    .filter((v): v is Item => v !== null)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export async function getItemBySlug(slug: string): Promise<Item | null> {
  const raw = await getJson<unknown>(itemBlobPath(slug));
  if (!raw) {
    return null;
  }
  const parsed = itemSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function saveItem(item: Item): Promise<Item> {
  const next: Item = { ...item, updatedAt: new Date().toISOString() };
  const parsed = itemSchema.parse(next);
  await putJson(itemBlobPath(parsed.slug), parsed);
  return parsed;
}

type CreateItemParams = {
  name: string;
  phoneE164: string | null;
  description: string;
  notes: string;
  status: ItemStatus;
  submittedAt: Date;
  expiresAt: Date;
};

export async function createItem(params: CreateItemParams): Promise<Item> {
  let slug = newSlug();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existing = await getItemBySlug(slug);
    if (!existing) {
      break;
    }
    slug = newSlug();
  }

  const now = new Date().toISOString();
  const item: Item = {
    id: slug,
    slug,
    name: params.name,
    phoneE164: params.phoneE164,
    description: params.description,
    notes: params.notes,
    status: params.status,
    hasUnreadReply: false,
    submittedAt: params.submittedAt.toISOString(),
    expiresAt: params.expiresAt.toISOString(),
    updatedAt: now,
    messages: [],
  };

  return saveItem(item);
}

export async function appendMessage(
  slug: string,
  message: ItemMessage,
  options: { markUnread: boolean },
): Promise<Item | null> {
  const item = await getItemBySlug(slug);
  if (!item) {
    return null;
  }
  const next: Item = {
    ...item,
    messages: [...item.messages, message],
    hasUnreadReply: options.markUnread ? true : item.hasUnreadReply,
  };
  return saveItem(next);
}

export async function findItemByPhone(phoneE164: string): Promise<Item | null> {
  const items = await listItems();
  const terminal: readonly ItemStatus[] = ["donated", "returned"];
  const matches = items.filter((i) => i.phoneE164 === phoneE164);
  if (matches.length === 0) {
    return null;
  }
  const nonTerminal = matches.filter((i) => !terminal.includes(i.status));
  const pool = nonTerminal.length > 0 ? nonTerminal : matches;
  return pool.reduce((latest, curr) =>
    curr.submittedAt > latest.submittedAt ? curr : latest,
  );
}
