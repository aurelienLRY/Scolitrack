"use client";

import { logout } from "@/action/signOut.action";
import { Button } from "@/components/shared/button";

/**
 * Logout form component
 * @returns Logout form
 */
export function LogoutForm() {
  return (
    <form action={logout}>
      <Button type="submit" variant="destructive">
        Se déconnecter
      </Button>
    </form>
  );
}
