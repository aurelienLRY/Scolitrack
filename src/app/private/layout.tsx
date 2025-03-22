import { SidebarProvider } from "@/components/layout/sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scolitrack - Dashboard",
  description: "Scolitrack - Dashboard",
};

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
