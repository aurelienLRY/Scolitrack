"use client";
import { PWAInstallPrompt } from "@/components/ui/PWAInstallPrompt";
import React from "react";
import { useNotification } from "@/hooks/useNotification";
import { useRoleStore } from "@/context/store/RoleStore";
import { usePrivilegeStore } from "@/context/store/PrivilegeStore";

export default function PrivateTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSubscribed, subscribe, isLoading } = useNotification();
  const { fetchRoles } = useRoleStore();
  const { fetchPrivileges } = usePrivilegeStore();

  React.useEffect(() => {
    if (!isSubscribed && !isLoading) {
      subscribe();
    }
  }, [isSubscribed, subscribe, isLoading]);

  React.useEffect(() => {
    fetchRoles();
    fetchPrivileges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {children}
      {process.env.NODE_ENV === "production" && <PWAInstallPrompt />}
    </>
  );
}
