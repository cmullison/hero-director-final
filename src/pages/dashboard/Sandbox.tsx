import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Code,
  FlaskConical,
  Zap,
  Wrench,
  Settings,
  Plus,
  ExternalLink,
  Play,
} from "lucide-react";
import ProviderAnalytics from "../sandbox/sandbox-analytics";

export default function DashboardSandbox() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50/30">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-orange-600/10 to-red-600/10" />
        <div className="relative p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Sandbox
              </h1>
              <p className="text-gray-600 mt-1">
                Experiment and test AI capabilities in a safe environment
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" className="h-9">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                size="sm"
                className="h-9 bg-gradient-to-r from-yellow-600 to-orange-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Experiment
              </Button>
            </div>
          </div>

          {/* Sandbox Blocks - Gradient Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Code className="h-8 w-8" />
                  <Play className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Code Playground</h3>
                <p className="text-blue-100 text-sm mb-3">
                  Test code generation & debugging
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                >
                  Launch
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <FlaskConical className="h-8 w-8" />
                  <Wrench className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">API Testing</h3>
                <p className="text-green-100 text-sm mb-3">
                  Test API calls & integrations
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                >
                  Test
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Zap className="h-8 w-8" />
                  <FlaskConical className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Model Testing</h3>
                <p className="text-purple-100 text-sm mb-3">
                  Compare model outputs & performance
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                >
                  Compare
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Wrench className="h-8 w-8" />
                  <Code className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Prompt Lab</h3>
                <p className="text-orange-100 text-sm mb-3">
                  Design & optimize prompts
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                >
                  Create
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 space-y-6">
        <ProviderAnalytics />
      </div>
    </div>
  );
}
