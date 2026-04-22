import { getNotification } from "@/lib/homepage/notification";

import { NotificationForm } from "./_components/notification-form";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const notification = await getNotification();

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Control the sitewide notification banner shown at the top of the
          homepage.
        </p>
      </header>
      <NotificationForm notification={notification} />
    </section>
  );
}
