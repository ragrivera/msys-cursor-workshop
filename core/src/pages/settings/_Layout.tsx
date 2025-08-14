import React from "react";
import { Settings, User, Bell, Shield, Palette, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsLayout() {
  const { user } = useAuthStore();
  const [darkMode, setDarkMode] = React.useState(
    document.documentElement.classList.contains("dark")
  );
  const [notifications, setNotifications] = React.useState(true);
  const [emailAlerts, setEmailAlerts] = React.useState(false);

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and application preferences
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Name
                </label>
                <p className="text-muted-foreground">
                  {user?.name || "Not set"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <p className="text-muted-foreground">
                  {user?.email || "Not set"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Role
                </label>
                <p className="text-muted-foreground capitalize">
                  {user?.role || "Not set"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Last Login
                </label>
                <p className="text-muted-foreground">
                  {user?.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : "Not available"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Dark Mode
                </label>
                <p className="text-xs text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Push Notifications
                </label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications for tournament updates
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Email Alerts
                </label>
                <p className="text-xs text-muted-foreground">
                  Receive email notifications for important events
                </p>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  App Version
                </label>
                <p className="text-muted-foreground">v1.0.0</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Environment
                </label>
                <p className="text-muted-foreground">Development</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  API Status
                </label>
                <p className="text-green-600">Connected</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Database
                </label>
                <p className="text-green-600">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Session Management
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
