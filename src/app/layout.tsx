import type { Metadata } from "next";
import { Raleway, Montserrat } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scolitack",
  description: "Simplifiez vous la vie avec Scolitack",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className="scroll-smooth antialiased [font-feature-settings:'ss01'] transition-colors duration-250"
    >
      <body
        className={cn(
          " bg-background antialiased",
          raleway.variable,
          montserrat.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
