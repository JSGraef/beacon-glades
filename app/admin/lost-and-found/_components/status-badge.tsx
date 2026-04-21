import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE_VARIANT, STATUS_LABELS } from "@/lib/lost-and-found/display";
import type { ItemStatus } from "@/lib/lost-and-found/types";

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <Badge variant={STATUS_BADGE_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>
  );
}
