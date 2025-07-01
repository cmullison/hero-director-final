import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  User,
  Palette,
  Globe,
  Lock,
  Database,
  Plus,
  ExternalLink,
} from "lucide-react";

export default function Settings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50/30">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 via-slate-600/10 to-zinc-600/10" />
        <div className="relative p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Configure your dashboard preferences and account settings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" className="h-9">
                <Globe className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                className="h-9 bg-gradient-to-r from-gray-600 to-slate-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Setting
              </Button>
            </div>
          </div>

          {/* Settings Blocks - Gradient Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <User className="h-8 w-8" />
                  <SettingsIcon className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Account</h3>
                <p className="text-blue-100 text-sm mb-3">
                  Profile, preferences & billing
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                >
                  Manage
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Shield className="h-8 w-8" />
                  <Lock className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Security</h3>
                <p className="text-green-100 text-sm mb-3">
                  Privacy, authentication & access
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                >
                  Configure
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Bell className="h-8 w-8" />
                  <Palette className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Notifications</h3>
                <p className="text-purple-100 text-sm mb-3">
                  Alerts, emails & preferences
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                >
                  Setup
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Database className="h-8 w-8" />
                  <Globe className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Data & API</h3>
                <p className="text-orange-100 text-sm mb-3">
                  Integrations, exports & backups
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                >
                  Manage
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 space-y-6">
        <div className="mt-8 p-6 border border-dashed rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Placeholder for Settings
          </p>
        </div>
      </div>
    </div>
  );
}
