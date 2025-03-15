import { requiredAuth } from "@/lib/auth/auth.helper";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requiredAuth();
  return <>{children}</>;
}
