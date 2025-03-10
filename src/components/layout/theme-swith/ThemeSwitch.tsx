"use client";

import { useTheme } from "next-themes";
import { SunIcon } from "@/components/icons/SunIcon";
import { MoonIcon } from "@/components/icons/MoonIcon";
import { useEffect, useState } from "react";

export function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" aria-hidden="true" />;
  }

  return (
    <button
      className="theme-switch-button  group w-10 h-10"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Changer le thème"
    >
      <div className="relative flex items-center justify-center p-1">
        {resolvedTheme === "dark" ? (
          <SunIcon className=" w-5 h-5 group-hover:text-secondary transition-all duration-300" />
        ) : (
          <MoonIcon className=" w-5 h-5 group-hover:text-secondary transition-all duration-300" />
        )}
      </div>
    </button>
  );
}
