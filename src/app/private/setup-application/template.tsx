"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { adminNavItems } from "./setup-NavItem.data";
import { useRoleStore } from "@/context/store/RoleStore";
import { usePrivilegeStore } from "@/context/store/PrivilegeStore";

export default function AdminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { fetchRoles } = useRoleStore();
  const { fetchPrivileges } = usePrivilegeStore();

  React.useEffect(() => {
    fetchRoles();
    fetchPrivileges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4">
        <Link
          href="/private/setup-application"
          className={cn(
            "text-sm font-medium hover:text-accent transition-all duration-300"
          )}
        >
          <h2 className="">
            Paramètres{" "}
            <span className="text-xl text-accent">de l&apos;application</span>
          </h2>
        </Link>
        <nav className="flex gap-4 mb-4">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                pathname === item.href && "text-accent pb-0.5 border-b ",
                " hover:text-accent transition-all duration-300"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </>
  );
}
