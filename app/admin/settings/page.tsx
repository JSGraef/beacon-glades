import { getSettings } from "@/lib/lost-and-found/settings";

import { SettingsForm } from "./_components/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure lost-and-found messaging and expiration behavior.
        </p>
      </header>
      <SettingsForm settings={settings} />
    </section>
  );
}
