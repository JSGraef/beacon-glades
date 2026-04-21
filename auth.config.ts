import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

import { isAdminEmail } from "@/lib/admin-allowlist";

export const authConfig = {
  providers: [Google],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    signIn: ({ profile }) => isAdminEmail(profile?.email),
    authorized: ({ auth, request }) => {
      const onAdmin = request.nextUrl.pathname.startsWith("/admin");
      if (!onAdmin) {
        return true;
      }
      return isAdminEmail(auth?.user?.email);
    },
  },
} satisfies NextAuthConfig;
