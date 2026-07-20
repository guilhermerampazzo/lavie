"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      className="rounded-btn border-line text-sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sair
    </Button>
  );
}
