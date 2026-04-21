import { listItems } from "@/lib/lost-and-found/items";
import { getSettings } from "@/lib/lost-and-found/settings";

import { ItemsTable } from "./_components/items-table";

export const dynamic = "force-dynamic";

export default async function AdminLostAndFoundPage() {
  const [items, settings] = await Promise.all([listItems(), getSettings()]);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Lost and Found</h1>
        <p className="text-sm text-muted-foreground">
          Found discs, texted to their owner. Reply threads and status live here.
        </p>
      </header>
      <ItemsTable initialItems={items} settings={settings} />
    </section>
  );
}
