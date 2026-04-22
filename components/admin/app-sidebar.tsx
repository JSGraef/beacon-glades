"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  CalendarDays,
  Home,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  Settings,
} from "lucide-react";

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
  useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
  {
    title: "Homepage",
    href: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Events",
    href: "/admin/events",
    icon: CalendarDays,
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
  const { isMobile, state } = useSidebar();
  const isIconCollapsed = !isMobile && state === "collapsed";

  return (
    <Sidebar className="pt-0" collapsible="icon" variant="inset">
      <SidebarHeader className="h-16 shrink-0 border-b border-border p-0">
        <div
          className={
            isIconCollapsed
              ? "flex h-full items-center justify-center px-1"
              : "flex h-full items-center px-3"
          }
          title={isIconCollapsed ? "Beacon Glades Admin" : undefined}
        >
          <p className="text-sm font-semibold text-sidebar-foreground">
            {isIconCollapsed ? "BG" : "Beacon Glades Admin"}
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive =
                  item.href === "/" || item.href === "/admin"
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
        <div className="hidden px-2 pb-2 group-data-[collapsible=icon]:block">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                type="button"
                tooltip="Sign out"
                onClick={() => {
                  void signOut({ callbackUrl: "/" });
                }}
              >
                <LogOut />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
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
