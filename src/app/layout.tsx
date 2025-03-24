import { Raleway, Montserrat } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";

export { metadata } from "./metadata";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

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
          " bg-background-body ",
          raleway.variable,
          montserrat.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
