"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { IoSunny, IoMoon } from "react-icons/io5";
import { Switch } from "@/components/ui/switch";

export function ThemeSwitchAlt() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Switch
      checked={resolvedTheme === "dark"}
      onChange={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      icon={<IoMoon className="h-4 w-4" />}
      iconAlt={<IoSunny className="h-4 w-4" />}
      label={resolvedTheme === "dark" ? "Mode sombre" : "Mode clair"}
    />
  );
}
