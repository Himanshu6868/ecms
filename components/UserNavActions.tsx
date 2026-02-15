"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserNavActions() {
  return (
    <div className="flex items-center gap-2">
      <Button type="button" size="sm" onClick={() => signOut({ callbackUrl: "/login" })} className="gap-1.5">
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
