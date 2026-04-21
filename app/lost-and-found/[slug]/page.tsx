import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getItemBySlug, saveItem } from "@/lib/lost-and-found/items";
import {
  PUBLIC_SELECTABLE_STATUSES,
  publicUpdateInputSchema,
  type PublicSelectableStatus,
} from "@/lib/lost-and-found/types";

import { PublicItemForm } from "./_components/public-item-form";

export const dynamic = "force-dynamic";

async function updatePublicItemAction(
  slug: string,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  "use server";

  const raw = {
    status: formData.get("status")?.toString() ?? "",
    notes: formData.get("notes")?.toString() ?? "",
  };
  const parsed = publicUpdateInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const item = await getItemBySlug(slug);
  if (!item) {
    return { ok: false, error: "Not found" };
  }
  if (item.status === "expired") {
    return { ok: false, error: "This link is no longer active." };
  }

  const timestamp = new Date().toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const appendedNote = (parsed.data.notes ?? "").trim();
  const nextNotes = appendedNote
    ? [item.notes, `— owner (${timestamp}): ${appendedNote}`]
        .filter(Boolean)
        .join("\n")
    : item.notes;

  const nextStatus: PublicSelectableStatus = parsed.data.status;

  await saveItem({
    ...item,
    status: nextStatus,
    notes: nextNotes,
  });

  revalidatePath(`/lost-and-found/${slug}`);
  revalidatePath("/admin/lost-and-found");
  return { ok: true };
}

export default async function PublicLostAndFoundPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const isExpired = item.status === "expired";
  const action = updatePublicItemAction.bind(null, slug);
  const currentStatus: PublicSelectableStatus =
    PUBLIC_SELECTABLE_STATUSES.find((s) => s === item.status) ?? "saving";

  return (
    <main className="min-h-svh bg-muted/30 px-4 py-10">
      <div className="mx-auto flex max-w-md flex-col gap-5">
        <header className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Beacon Glades Disc Golf
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            We have your disc, {item.name}.
          </h1>
        </header>

        <section className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Description
          </span>
          <p className="mt-1 text-sm">{item.description}</p>
        </section>

        {isExpired ? (
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <p className="font-medium">This link is no longer active.</p>
            <p className="mt-1 text-muted-foreground">
              If you still believe this disc is yours, please reach out to us
              directly at the course.
            </p>
          </div>
        ) : (
          <PublicItemForm currentStatus={currentStatus} action={action} />
        )}
      </div>
    </main>
  );
}
