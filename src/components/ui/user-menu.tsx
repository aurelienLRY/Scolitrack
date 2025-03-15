"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ThemeSwitchAlt } from "@/components/layout/theme-switch/ThemeSwitchAlt";
import { Tooltip } from "@/components/shared/tooltip";

/**
 * User menu component
 * @returns User menu
 */
export function UserMenu() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;
  const user = session.user;

  return (
    <Tooltip content="Mon espace" position="left">
      <div className="relative text-black" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full outline-none ring-offset-2 transition-opacity hover:opacity-80 focus:ring-2 focus:ring-slate-950"
        >
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-100">
            {user.image ? (
              <Image
                src={user.image ?? "/img/default_avatar.svg"}
                alt={user.name ?? "Avatar"}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-medium uppercase text-slate-900">
                {user.name?.[0] ?? user.email?.[0] ?? "?"}
              </span>
            )}
          </div>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 min-w-[200px] rounded-md border bg-white p-1 shadow-md">
            <div className="border-b px-2 py-2">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            <ThemeSwitchAlt />

            <button
              className={cn(
                "w-full text-left",
                "flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none",
                "hover:bg-slate-100 focus:bg-slate-100"
              )}
              onClick={() => {
                router.push("/private/my-account");
                setIsOpen(false);
              }}
            >
              Mon compte
            </button>

            <button
              className={cn(
                "w-full text-left",
                "flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none",
                "text-red-600 hover:bg-red-100 focus:bg-red-100"
              )}
              onClick={() => {
                signOut({ callbackUrl: "/" });
                setIsOpen(false);
              }}
            >
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </Tooltip>
  );
}
