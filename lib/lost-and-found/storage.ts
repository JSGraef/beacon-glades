import { BlobNotFoundError, del, get, list, put } from "@vercel/blob";

const BLOB_CONTENT_TYPE = "application/json";

export async function putJson<T>(pathname: string, value: T): Promise<void> {
  await put(pathname, JSON.stringify(value, null, 2), {
    access: "private",
    contentType: BLOB_CONTENT_TYPE,
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

export async function getJson<T>(pathname: string): Promise<T | null> {
  try {
    const result = await get(pathname, {
      access: "private",
      useCache: false,
    });
    if (!result || result.statusCode !== 200) {
      return null;
    }
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as T;
  } catch (err) {
    if (err instanceof BlobNotFoundError) {
      return null;
    }
    if (err instanceof Error && /not ?found/i.test(err.message)) {
      return null;
    }
    throw err;
  }
}

export async function listPathnames(prefix: string): Promise<string[]> {
  const out: string[] = [];
  let cursor: string | undefined;
  do {
    const res = await list({ prefix, cursor });
    for (const blob of res.blobs) {
      out.push(blob.pathname);
    }
    cursor = res.cursor;
  } while (cursor);
  return out;
}

export async function deletePath(pathname: string): Promise<void> {
  try {
    await del(pathname);
  } catch {
    // ignore
  }
}
