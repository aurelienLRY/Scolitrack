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
  return children;
}
