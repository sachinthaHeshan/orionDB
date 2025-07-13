"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Home,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderOpen,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-full bg-background border-r border-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed && "justify-center"
          )}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ER</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-foreground">ER Designer</span>
          )}
        </div>

        {onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          );
        })}

        {/* Theme Toggle */}
        <div className="pt-4 border-t border-border">
          <div
            className={cn(
              "flex",
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </div>
  );
}
