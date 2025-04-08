"use client";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

/**
 * Query Provider
 * @param children
 * @returns
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") {
    return <QueryProviderProduction>{children}</QueryProviderProduction>;
  }
  return <QueryProviderDevtools>{children}</QueryProviderDevtools>;
}

/**
 * Production Query Provider
 * @param children
 * @returns
 */
function QueryProviderProduction({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: true,
        retry: 2,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

/**
 * Development Query Provider
 * @param children
 * @returns
 */
function QueryProviderDevtools({ children }: { children: ReactNode }) {
  const queryClientDev = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 5000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClientDev}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
