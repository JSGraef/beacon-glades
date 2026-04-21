export function getAppBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, "");
  }
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) {
    return `https://${vercel.replace(/\/+$/, "")}`;
  }
  return "http://localhost:3000";
}

export function getPublicItemUrl(slug: string): string {
  return `${getAppBaseUrl()}/lost-and-found/${slug}`;
}
