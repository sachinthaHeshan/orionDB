"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("light");
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");

  // Load theme from localStorage and system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("appSettings");
    let initialTheme: Theme = "light";

    if (savedTheme) {
      try {
        const settings = JSON.parse(savedTheme);
        initialTheme = settings.theme || "light";
      } catch (error) {
        console.error("Failed to parse saved theme:", error);
      }
    }

    setTheme(initialTheme);
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        setActualTheme(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Update actual theme based on theme preference
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setActualTheme(mediaQuery.matches ? "dark" : "light");
    } else {
      setActualTheme(theme);
    }
  }, [theme]);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;

    if (actualTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [actualTheme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);

    // Update localStorage
    const currentSettings = localStorage.getItem("appSettings");
    let settings = { theme: newTheme };

    if (currentSettings) {
      try {
        settings = { ...JSON.parse(currentSettings), theme: newTheme };
      } catch (error) {
        console.error("Failed to parse current settings:", error);
      }
    }

    localStorage.setItem("appSettings", JSON.stringify(settings));
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme: handleSetTheme, actualTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
