"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PackageSearch, Settings } from "lucide-react";

import { SignOutButton } from "@/app/admin/_components/sign-out-button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const navigation = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Lost and Found",
    href: "/admin/lost-and-found",
    icon: PackageSearch,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
] as const;

export function AppSidebar({
  userEmail,
}: {
  userEmail: string | null;
}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-3 py-2">
          <p className="text-sm font-semibold text-sidebar-foreground">
            Beacon Glades Admin
          </p>
          <p className="text-xs text-sidebar-foreground/70">
            Minimal internal tools
          </p>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2 px-2 pb-2 group-data-[collapsible=icon]:hidden">
          {userEmail ? (
            <div className="flex flex-col gap-0.5 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-2 py-1.5">
              <span className="text-[10px] uppercase tracking-wide text-sidebar-foreground/60">
                Signed in as
              </span>
              <span className="truncate text-xs font-medium text-sidebar-foreground">
                {userEmail}
              </span>
            </div>
          ) : null}
          <SignOutButton />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
