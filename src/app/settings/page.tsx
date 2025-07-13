"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Palette,
  Database,
  Bell,
  Shield,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
} from "lucide-react";

interface Settings {
  theme: "light" | "dark" | "system";
  notifications: boolean;
  autoSave: boolean;
  defaultTemplate: string;
  exportFormat: "json" | "sql" | "png";
  gridSize: number;
  snapToGrid: boolean;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<Omit<Settings, "theme">>({
    notifications: true,
    autoSave: true,
    defaultTemplate: "basic",
    exportFormat: "json",
    gridSize: 20,
    snapToGrid: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Extract non-theme settings
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { theme, ...otherSettings } = parsed;
        setSettings(otherSettings);
      } catch (error) {
        console.error("Failed to parse saved settings:", error);
      }
    }
  }, []);

  const handleSettingChange = (
    key: keyof Settings,
    value: Settings[keyof Settings]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem("appSettings", JSON.stringify(settings));
      setLastSaved(new Date());
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all settings to default values?"
      )
    ) {
      const defaultSettings: Omit<Settings, "theme"> = {
        notifications: true,
        autoSave: true,
        defaultTemplate: "basic",
        exportFormat: "json",
        gridSize: 20,
        snapToGrid: true,
      };
      setSettings(defaultSettings);
      setTheme("light");
      localStorage.removeItem("appSettings");
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "er-designer-settings.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
        } catch {
          alert("Failed to import settings. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-6 bg-white min-h-full">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">
              Customize your ER Designer experience
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-sm text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <Button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) =>
                    setTheme(e.target.value as "light" | "dark" | "system")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grid Size
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={settings.gridSize}
                  onChange={(e) =>
                    handleSettingChange("gridSize", parseInt(e.target.value))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>10px</span>
                  <span>{settings.gridSize}px</span>
                  <span>50px</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700">
                    Snap to Grid
                  </label>
                  <p className="text-sm text-gray-500">
                    Automatically align elements to grid
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.snapToGrid}
                    onChange={(e) =>
                      handleSettingChange("snapToGrid", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Project Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Project Settings
              </CardTitle>
              <CardDescription>
                Configure default project behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Template
                </label>
                <select
                  value={settings.defaultTemplate}
                  onChange={(e) =>
                    handleSettingChange("defaultTemplate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="basic">Basic</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="blog">Blog</option>
                  <option value="crm">CRM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <select
                  value={settings.exportFormat}
                  onChange={(e) =>
                    handleSettingChange("exportFormat", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="json">JSON</option>
                  <option value="sql">SQL</option>
                  <option value="png">PNG</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700">Auto Save</label>
                  <p className="text-sm text-gray-500">
                    Automatically save changes
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) =>
                      handleSettingChange("autoSave", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700">
                    Enable Notifications
                  </label>
                  <p className="text-sm text-gray-500">
                    Receive notifications for important updates
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) =>
                      handleSettingChange("notifications", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Import, export, and manage your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleExportSettings}
                  className="flex items-center gap-2 flex-1"
                >
                  <Download size={16} />
                  Export Settings
                </Button>
                <div className="flex-1">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSettings}
                    className="hidden"
                    id="import-settings"
                  />
                  <label htmlFor="import-settings">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 w-full"
                      asChild
                    >
                      <span>
                        <Upload size={16} />
                        Import Settings
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={handleResetSettings}
                className="w-full flex items-center gap-2"
              >
                <Trash2 size={16} />
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
