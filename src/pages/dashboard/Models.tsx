import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Zap,
  Bot,
  Sparkles,
  Settings,
  Plus,
  ExternalLink,
  Cpu,
} from "lucide-react";

export default function DashboardModels() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10" />
        <div className="relative p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                AI Models
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and monitor your AI model usage and performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" className="h-9">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                size="sm"
                className="h-9 bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Model
              </Button>
            </div>
          </div>

          {/* AI Model Blocks - Gradient Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Brain className="h-8 w-8" />
                  <Sparkles className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Claude</h3>
                <p className="text-purple-100 text-sm mb-3">
                  Advanced reasoning & analysis
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
                  <Zap className="h-8 w-8" />
                  <Cpu className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">GPT-4</h3>
                <p className="text-green-100 text-sm mb-3">
                  Powerful language understanding
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
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Bot className="h-8 w-8" />
                  <Sparkles className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Gemini</h3>
                <p className="text-blue-100 text-sm mb-3">
                  Multimodal AI capabilities
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                >
                  Deploy
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Cpu className="h-8 w-8" />
                  <Brain className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Custom Models</h3>
                <p className="text-orange-100 text-sm mb-3">
                  Fine-tuned & specialized models
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
    </div>
  );
}
