"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

interface ModeToggleProps {
  hideIcons?: boolean;
}

export function ModeToggle({ hideIcons }: ModeToggleProps) {
  const {  setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`flex items-center ${hideIcons ? "justify-center" : "space-x-2"}`}>
      {/* Sun Icon (conditionally hidden) */}
      {!hideIcons && (
        <SunIcon
          className={`h-5 w-5 ${
            resolvedTheme === "light" ? "text-yellow-500" : "text-gray-500"
          }`}
        />
      )}
      {/* Theme Toggle Switch */}
      <Switch
        checked={resolvedTheme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      {/* Moon Icon (conditionally hidden) */}
      {!hideIcons && (
        <MoonIcon
          className={`h-5 w-5 ${
            resolvedTheme === "dark" ? "text-blue-500" : "text-gray-500"
          }`}
        />
      )}
    </div>
  );
}
