import { DEFAULT_SETTINGS, settingsSchema, type Settings } from "./types";
import { getJson, putJson } from "./storage";
import { SETTINGS_PATH } from "./slug";

export async function getSettings(): Promise<Settings> {
  const raw = await getJson<unknown>(SETTINGS_PATH);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return DEFAULT_SETTINGS;
  }
  return parsed.data;
}

export async function updateSettings(next: Settings): Promise<Settings> {
  const parsed = settingsSchema.parse(next);
  await putJson(SETTINGS_PATH, parsed);
  return parsed;
}
