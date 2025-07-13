"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "system") {
      return <Monitor size={16} />;
    }
    return actualTheme === "dark" ? <Moon size={16} /> : <Sun size={16} />;
  };

  const getLabel = () => {
    if (theme === "system") {
      return `System (${actualTheme})`;
    }
    return theme === "dark" ? "Dark" : "Light";
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="gap-2"
      title={`Current theme: ${getLabel()}`}
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
    </Button>
  );
}
