import { RolesPrivilegesProvider } from "@/context/RolesPrivilegesProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RolesPrivilegesProvider>{children}</RolesPrivilegesProvider>;
}
