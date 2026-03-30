"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { enrollmentNavItems } from "./enrollment-NavItem.data";

export default function EnrollmentTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  console.log("pathname",pathname);
  
  return (
    <>
      <div className="flex flex-col gap-4">
        <Link
          href="/private/enrollment"
          className={cn(
            "text-sm font-medium hover:text-accent transition-all duration-300"
          )}
        >
          <h2 className="text-center md:text-left">
            Gestion des{" "}
            <span className="text-xl text-accent">inscriptions scolaires</span>
          </h2>
        </Link>
        <nav className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
          {enrollmentNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                (pathname === item.href || pathname.startsWith(item.href) ) && "text-accent pb-0.5 border-b border-accent",
                "hover:text-accent transition-all duration-300 text-sm font-medium"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="min-h-[70vh] w-full container mx-auto mt-24">
      {children}
      </div>
    </>
  );
}
