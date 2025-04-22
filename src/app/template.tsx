"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import HeaderSwitch from "@/components/layout/header/HeaderSwitch";
import Footer from "@/components/layout/footer/Footer";
import QueryProvider from "@/lib/providers/query-provider";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SessionProvider>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <main>
            <HeaderSwitch>{children}</HeaderSwitch>
            <Footer />
          </main>
          <Toaster position="top-center" richColors closeButton />
        </NextThemesProvider>
      </SessionProvider>
    </QueryProvider>
  );
}

Template.displayName = "First-template";
