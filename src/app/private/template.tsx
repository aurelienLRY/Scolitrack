"use client";
import { PWAInstallPrompt } from "@/components/ui/PWAInstallPrompt";
import React from "react";
import { useNotification } from "@/hooks/useNotification";
import { SidebarLayout } from "@/components/layout/sidebar";
import { useIsAuthenticated } from "@/hooks/useAuthorization";
import { unauthorized } from "next/navigation";
export default function PrivateTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSubscribed, subscribe, isLoading } = useNotification();

  React.useEffect(() => {
    if (!isSubscribed && !isLoading) {
      subscribe();
    }
  }, [isSubscribed, subscribe, isLoading]);

  const { isAuthenticated, isLoading: isLoadingAuth } = useIsAuthenticated();
  if (isLoadingAuth) {
    return;
  }

  if (!isAuthenticated) {
    return unauthorized();
  }

  return (
    <>
      <SidebarLayout>{children}</SidebarLayout>
      {process.env.NODE_ENV === "production" && <PWAInstallPrompt />}
    </>
  );
}
