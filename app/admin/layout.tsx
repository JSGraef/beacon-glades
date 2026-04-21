import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-allowlist";

import { AdminLayoutClient } from "./_components/admin-layout-client";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();
  const email = session?.user?.email ?? null;

  // Belt-and-suspenders: middleware already protects /admin/*, but re-check here
  // so a compromised middleware config can't expose admin pages.
  if (!isAdminEmail(email)) {
    redirect("/api/auth/signin?callbackUrl=/admin");
  }

  return (
    <AdminLayoutClient userEmail={email}>{children}</AdminLayoutClient>
  );
}
