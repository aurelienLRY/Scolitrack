"use client";
import { PWAInstallPrompt } from "@/components/ui/PWAInstallPrompt";
import React from "react";
import { useNotification } from "@/hooks/useNotification";
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

  return (
    <>
      {children}
      <PWAInstallPrompt />
    </>
  );
}
