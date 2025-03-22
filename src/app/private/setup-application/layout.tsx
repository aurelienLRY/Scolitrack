"use client";

import { RolesPrivilegesProvider } from "@/context/RolesPrivilegesProvider";
import Authorization from "@/components/auth/Authorization";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RolesPrivilegesProvider>
      <Authorization privilege="SETUP_APPLICATION">
        <>{children}</>
      </Authorization>
    </RolesPrivilegesProvider>
  );
}
