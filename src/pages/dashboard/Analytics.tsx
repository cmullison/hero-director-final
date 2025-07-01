import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Tabs from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileHeader } from "@/components/ui/profile-header";
import {
  Brain,
  Zap,
  Code,
  Database,
  Users,
  TrendingUp,
  Activity,
  FileText,
  MessageSquare,
  Settings,
  Plus,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Sparkles,
  Workflow,
  Palette,
  Bot,
  Image as ImageIcon,
  Video,
  Mic,
  Search,
  Globe,
  GitBranch,
} from "lucide-react";

const quickActionTabs = [
  "AI Models",
  "Content Creation",
  "Analytics",
  "Team Tools",
  "Integrations",
];

const feedItems = [
  {
    id: 1,
    type: "project",
    title: "AI Assistant Integration",
    description: "New Claude integration deployed to production",
    user: {
      name: "Sarah Chen",
      avatar: "/api/placeholder/32/32",
      initials: "SC",
    },
    timestamp: "2 minutes ago",
    status: "completed",
    priority: "high",
    tags: ["AI", "Production"],
  },
  {
    id: 2,
    type: "analytics",
    title: "Daily Usage Report",
    description: "API calls increased by 23% from yesterday",
    user: {
      name: "Mike Johnson",
      avatar: "/api/placeholder/32/32",
      initials: "MJ",
    },
    timestamp: "15 minutes ago",
    status: "info",
    priority: "normal",
    tags: ["Analytics", "Usage"],
  },
  {
    id: 3,
    type: "team",
    title: "Team Collaboration Update",
    description: "3 new team members added to Development workspace",
    user: {
      name: "Alex Rivera",
      avatar: "/api/placeholder/32/32",
      initials: "AR",
    },
    timestamp: "1 hour ago",
    status: "pending",
    priority: "normal",
    tags: ["Team", "Workspace"],
  },
  {
    id: 4,
    type: "model",
    title: "Model Performance Alert",
    description: "GPT-4 response time optimization completed",
    user: {
      name: "Emma Davis",
      avatar: "/api/placeholder/32/32",
      initials: "ED",
    },
    timestamp: "2 hours ago",
    status: "completed",
    priority: "high",
    tags: ["Models", "Performance"],
  },
];

export default function DashboardAnalytics() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <ProfileHeader
        title="Dashboard Overview"
        subtitle="Manage your AI-powered workspace and track performance"
        fieldOfWork="AI-powered workspace management"
      />

      {/* Main Content Area */}
      <div className="px-6 pb-6 space-y-6">
        {/* AI Integration Blocks - Gradient Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700" />
            <CardContent className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <Brain className="h-8 w-8" />
                <Sparkles className="h-5 w-5 opacity-70" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Anthropic Claude</h3>
              <p className="text-purple-100 text-sm mb-3">
                Advanced reasoning & analysis
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
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600" />
            <CardContent className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <Palette className="h-8 w-8" />
                <Badge className="bg-white/20 text-white">NEW</Badge>
              </div>
              <h3 className="font-semibold text-lg mb-1">Content Studio</h3>
              <p className="text-blue-100 text-sm mb-3">
                Generate images, videos & text
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

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600" />
            <CardContent className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <Bot className="h-8 w-8" />
                <Activity className="h-5 w-5 opacity-70" />
              </div>
              <h3 className="font-semibold text-lg mb-1">AI Agents</h3>
              <p className="text-emerald-100 text-sm mb-3">
                Automated workflows & tasks
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
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600" />
            <CardContent className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <BarChart3 className="h-8 w-8" />
                <TrendingUp className="h-5 w-5 opacity-70" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Analytics Hub</h3>
              <p className="text-orange-100 text-sm mb-3">
                Performance insights & metrics
              </p>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
              >
                Analyze
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions with Tabs */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Quick Actions
            </CardTitle>
            <CardDescription>
              Access your most-used tools and features
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs
              tabs={quickActionTabs}
              onTabChange={handleTabChange}
              initialActiveIndex={activeTabIndex}
            />

            {/* Tab Content */}
            <div className="p-6">
              {activeTabIndex === 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <Brain className="h-6 w-6" />
                    <span className="text-sm">Claude</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <Zap className="h-6 w-6" />
                    <span className="text-sm">GPT-4</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <Code className="h-6 w-6" />
                    <span className="text-sm">Codex</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-sm">DALL-E</span>
                  </Button>
                </div>
              )}
              {activeTabIndex === 1 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Writer</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-sm">Image Gen</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <Video className="h-6 w-6" />
                    <span className="text-sm">Video</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <Mic className="h-6 w-6" />
                    <span className="text-sm">Audio</span>
                  </Button>
                </div>
              )}
              {activeTabIndex === 2 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">Reports</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-sm">Metrics</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <Activity className="h-6 w-6" />
                    <span className="text-sm">Usage</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <Database className="h-6 w-6" />
                    <span className="text-sm">Data</span>
                  </Button>
                </div>
              )}
              {activeTabIndex === 3 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Team</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <MessageSquare className="h-6 w-6" />
                    <span className="text-sm">Chat</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <Workflow className="h-6 w-6" />
                    <span className="text-sm">Workflows</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <GitBranch className="h-6 w-6" />
                    <span className="text-sm">Projects</span>
                  </Button>
                </div>
              )}
              {activeTabIndex === 4 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <Globe className="h-6 w-6" />
                    <span className="text-sm">API</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <Search className="h-6 w-6" />
                    <span className="text-sm">Search</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <Database className="h-6 w-6" />
                    <span className="text-sm">Database</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <Settings className="h-6 w-6" />
                    <span className="text-sm">Config</span>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dense Data Cards and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dense Analytics Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        API Calls
                      </p>
                      <p className="text-2xl font-bold">124.8K</p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12.5%
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Active Users
                      </p>
                      <p className="text-2xl font-bold">2,847</p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +8.2%
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Avg Response
                      </p>
                      <p className="text-2xl font-bold">1.2s</p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        -0.3s
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Success Rate
                      </p>
                      <p className="text-2xl font-bold">99.8%</p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +0.1%
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Insights */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  User Insights
                </CardTitle>
                <CardDescription>
                  Real-time user engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Single users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-blue-100 rounded-full">
                        <div className="w-16 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">67%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-sm">Team users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-emerald-100 rounded-full">
                        <div className="w-12 h-2 bg-emerald-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">48%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm">Enterprise</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-purple-100 rounded-full">
                        <div className="w-8 h-2 bg-purple-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">32%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {feedItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      index !== feedItems.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={item.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {item.user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(item.status)}
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.tags.map((tag, tagIndex) => (
                              <Badge
                                key={tagIndex}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {item.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100">
                <Button variant="outline" size="sm" className="w-full">
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
