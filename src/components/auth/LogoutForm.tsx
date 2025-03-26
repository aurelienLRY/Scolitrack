"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

/**
 * Logout form component
 * @returns Logout form
 */
export function LogoutForm() {
  const handleLogout = async () => {
    await signOut();
  };
  return (
    <form action={handleLogout}>
      <Button type="submit" variant="solid" color="destructive">
        Se déconnecter
      </Button>
    </form>
  );
}
