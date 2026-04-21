"use client";

import { LogOut } from "lucide-react";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      className="w-full justify-start gap-2"
      onClick={() => {
        void signOut({ callbackUrl: "/" });
      }}
      size="sm"
      variant="ghost"
    >
      <LogOut className="h-4 w-4" />
      <span>Sign out</span>
    </Button>
  );
}
