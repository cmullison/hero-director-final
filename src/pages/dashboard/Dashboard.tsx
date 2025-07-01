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
  Edit,
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

export default function Dashboard() {
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
    <div className="bg-gradient-to-br from-gray-50 via-background to-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-background dark:to-gray-900  p-6 space-y-6 font-sans h-full overflow-y-auto">
      {/* <div className="relative bg-gradient-to-br from-blue-200 via-pink-200 to-orange-200 p-4 rounded-xl">
        <div
          className="h-64 rounded-lg"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>
        ??
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"></div>
      </div> */}

      {/* Quick Actions */}
      <Card className="overflow-hidden">
        <CardHeader className="h-20 bg-gradient-to-br from-blue-200 via-pink-200 to-orange-200 p-2 dark:from-blue-900 dark:via-pink-900 dark:to-orange-900">
          <div
            className="p-2 w-full h-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            <CardTitle className="text-xl font-semibold">
              Quick Actions
            </CardTitle>
            <CardDescription className="">
              Access your most-used tools and features
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs
            tabs={quickActionTabs}
            onTabChange={handleTabChange}
            initialActiveIndex={activeTabIndex}
          />

          <div className="p-6">
            {activeTabIndex === 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Brain className="h-6 w-6" />
                  <span className="text-sm">Claude</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Zap className="h-6 w-6" />
                  <span className="text-sm">GPT-4</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Code className="h-6 w-6" />
                  <span className="text-sm">Codex</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-sm">DALL-E</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
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

            <Card>
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

            <Card>
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

            <Card>
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
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
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
  );
}
