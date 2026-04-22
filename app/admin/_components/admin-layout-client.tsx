"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/admin/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

function getCurrentPageLabel(pathname: string) {
  if (pathname === "/admin/lost-and-found") {
    return "Lost and Found";
  }
  if (pathname === "/admin/settings") {
    return "Settings";
  }

  return "Dashboard";
}

export function AdminLayoutClient({
  children,
  userEmail,
}: Readonly<{
  children: ReactNode;
  userEmail: string | null;
}>) {
  const pathname = usePathname();
  const currentPageLabel = getCurrentPageLabel(pathname);

  // Apply admin-theme to <body> while the admin layout is mounted so that
  // Radix Portal contents (mobile sidebar sheet, dialogs, toasts) inherit
  // the admin theme's CSS variables. Without this, tokens like `--sidebar`
  // are undefined outside the wrapper <div>, making the mobile drawer
  // transparent and letting page content bleed through.
  useEffect(() => {
    document.body.classList.add("admin-theme");
    return () => {
      document.body.classList.remove("admin-theme");
    };
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="admin-theme min-h-svh bg-background text-foreground font-sans">
        <SidebarProvider>
          <AppSidebar userEmail={userEmail} />
          <SidebarInset className="md:peer-data-[variant=inset]:mt-0 md:peer-data-[variant=inset]:rounded-t-none md:peer-data-[variant=inset]:rounded-b-xl md:peer-data-[variant=inset]:shadow-none">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <SidebarTrigger className="-ml-1" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink asChild>
                      <Link href="/admin">Admin</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentPageLabel}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex flex-1 flex-col gap-6 p-4">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </TooltipProvider>
  );
}
