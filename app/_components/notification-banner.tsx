import type { Notification } from "@/lib/homepage/types";

export function NotificationBanner({ notification }: { notification: Notification }) {
  const message = notification.message.trim();
  if (!notification.visible || !message) {
    return null;
  }

  return (
    <div className="bg-tertiary text-on-tertiary py-3 px-6 text-center font-label font-bold tracking-widest text-xs sm:text-sm uppercase">
      {message}
    </div>
  );
}
