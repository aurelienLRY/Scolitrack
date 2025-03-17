"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { IoSunny, IoMoon } from "react-icons/io5";
import { Button } from "@/components/shared/button";
import { Tooltip } from "@/components/shared/tooltip";

export function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Tooltip
      content={
        resolvedTheme === "dark"
          ? "Passer au thème clair"
          : "Passer au thème sombre"
      }
      position="left"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="relative hover:bg-slate-100 focus:bg-slate-100 hover:text-accent focus:text-accent cursor-pointer"
      >
        <IoSunny
          className={`h-5 w-5 transition-all  ${
            resolvedTheme === "dark"
              ? "scale-100 rotate-0"
              : "scale-0 -rotate-90"
          } absolute`}
        />
        <IoMoon
          className={`h-5 w-5 transition-all  ${
            resolvedTheme === "dark"
              ? "scale-0 rotate-90"
              : "scale-100 rotate-0"
          } absolute`}
        />
        <span className="sr-only">
          {resolvedTheme === "dark"
            ? "Passer au thème clair"
            : "Passer au thème sombre"}
        </span>
      </Button>
    </Tooltip>
  );
}
