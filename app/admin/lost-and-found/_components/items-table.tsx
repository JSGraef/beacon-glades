"use client";

import { useMemo, useState } from "react";
import { MessageCircleIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRelative } from "@/lib/lost-and-found/display";
import { formatE164ForDisplay } from "@/lib/lost-and-found/phone";
import {
  ITEM_STATUSES,
  type Item,
  type ItemStatus,
  type Settings,
} from "@/lib/lost-and-found/types";

import { ItemDetailSheet } from "./item-detail-sheet";
import { NewItemSheet } from "./new-item-sheet";
import { StatusBadge } from "./status-badge";

type FilterValue = "all" | ItemStatus;

const FILTER_TABS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  ...ITEM_STATUSES.map((s) => ({
    value: s satisfies ItemStatus as FilterValue,
    label: s.charAt(0).toUpperCase() + s.slice(1),
  })),
];

export function ItemsTable({
  initialItems,
  settings,
}: {
  initialItems: Item[];
  settings: Settings;
}) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [newOpen, setNewOpen] = useState(false);
  const [detailSlug, setDetailSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") {
      return initialItems;
    }
    return initialItems.filter((i) => i.status === filter);
  }, [initialItems, filter]);

  const selectedItem =
    detailSlug !== null
      ? initialItems.find((i) => i.slug === detailSlug) ?? null
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as FilterValue)}
        >
          <TabsList className="flex-wrap">
            {FILTER_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button onClick={() => setNewOpen(true)}>
          <PlusIcon />
          <span>New entry</span>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState filter={filter} onNew={() => setNewOpen(true)} />
      ) : (
        <>
          <ul className="flex flex-col gap-3 md:hidden">
            {filtered.map((item) => (
              <li key={item.slug}>
                <button
                  type="button"
                  className="flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
                  onClick={() => setDetailSlug(item.slug)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatE164ForDisplay(item.phoneE164) || "No phone"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.hasUnreadReply ? <UnreadDot /> : null}
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    Submitted {formatRelative(item.submittedAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden rounded-lg border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow
                    key={item.slug}
                    className="cursor-pointer"
                    onClick={() => setDetailSlug(item.slug)}
                  >
                    <TableCell>
                      {item.hasUnreadReply ? (
                        <span className="inline-flex items-center gap-1 text-primary">
                          <MessageCircleIcon className="size-4" />
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatE164ForDisplay(item.phoneE164) || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate text-muted-foreground">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelative(item.submittedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <NewItemSheet
        open={newOpen}
        onOpenChange={setNewOpen}
        daysUntilExpiration={settings.daysUntilExpiration}
      />
      <ItemDetailSheet
        item={selectedItem}
        open={selectedItem !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDetailSlug(null);
          }
        }}
      />
    </div>
  );
}

function UnreadDot() {
  return (
    <span
      aria-label="Unread reply"
      className="size-2 rounded-full bg-primary"
    />
  );
}

function EmptyState({
  filter,
  onNew,
}: {
  filter: FilterValue;
  onNew: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
      <p className="text-sm text-muted-foreground">
        {filter === "all"
          ? "No lost-and-found items yet."
          : `No items with status \"${filter}\".`}
      </p>
      {filter === "all" ? (
        <Button variant="outline" size="sm" onClick={onNew}>
          <PlusIcon />
          <span>Add the first one</span>
        </Button>
      ) : null}
    </div>
  );
}
