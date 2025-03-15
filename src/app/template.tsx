"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/footer";
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <main>
          <Header />
          {children}
          <Footer />
        </main>
        <Toaster position="top-center" richColors closeButton />
      </NextThemesProvider>
    </SessionProvider>
  );
}
