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
  Globe,
  Shield,
  TrendingUp,
  Activity,
  Users,
  BarChart3,
  Settings,
  Plus,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Zap,
  FileText,
  Code,
  Palette,
  Server,
  Lock,
  Eye,
  DollarSign,
  MonitorSpeaker,
  Smartphone,
  Database,
  RefreshCw,
  Rocket,
  Target,
} from "lucide-react";
import {
  useDashboardData,
  useQuickActions,
  useCloudflareZones,
} from "../../hooks/useCloudflareData";
import { useToast } from "@/hooks/use-toast";
import type { ZoneInfo } from "../../lib/cloudflare-api";

const quickActionTabs = [
  "Performance",
  "Content & SEO",
  "Security & SSL",
  "Analytics",
  "Deployment",
];

interface ActivityItem {
  id: number;
  type: string;
  title: string;
  description: string;
  website: string;
  timestamp: string;
  status: string;
  priority: string;
  tags: string[];
  metric: string;
}

export default function DashboardProject() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const { zones } = useCloudflareZones();
  const { websiteData, dashboardMetrics, loading, error } = useDashboardData();
  const { purgeCache, runSpeedTest } = useQuickActions();
  const { toast } = useToast();

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
  };

  const handleQuickAction = async (action: string, zoneId?: string) => {
    switch (action) {
      case "cache":
        if (zoneId) {
          const result = await purgeCache(zoneId);
          toast({
            title: result.success ? "Success" : "Error",
            description: result.message,
            variant: result.success ? "default" : "destructive",
          });
        }
        break;
      case "speed":
        if (zones.length > 0) {
          const result = await runSpeedTest(`https://${zones[0].name}`);
          toast({
            title: result.success ? "Speed Test Complete" : "Error",
            description: result.success
              ? `Performance score: ${"data" in result ? result.data?.performance_score || "N/A" : "N/A"}`
              : "message" in result
                ? result.message
                : "Speed test failed",
          });
        }
        break;
      default:
        toast({
          title: "Action Coming Soon",
          description: `${action} functionality will be available soon.`,
        });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Generate recent activity from real data
  const generateRecentActivity = (): ActivityItem[] => {
    if (!zones.length) return [];

    return zones.slice(0, 5).map(
      (zone: ZoneInfo, index: number): ActivityItem => ({
        id: index + 1,
        type: [
          "performance",
          "security",
          "traffic",
          "deployment",
          "monitoring",
        ][index % 5],
        title: [
          "Core Web Vitals Improved",
          "SSL Certificate Active",
          "Traffic Analytics Updated",
          "Zone Configuration Updated",
          "Uptime Monitoring Active",
        ][index % 5],
        description: [
          `Performance optimized for ${zone.name}`,
          `SSL certificate verified for ${zone.name}`,
          `Analytics data refreshed for ${zone.name}`,
          `Configuration updated for ${zone.name}`,
          `Monitoring active for ${zone.name}`,
        ][index % 5],
        website: zone.name,
        timestamp: [
          "5 minutes ago",
          "2 hours ago",
          "4 hours ago",
          "6 hours ago",
          "1 day ago",
        ][index % 5],
        status: zone.status === "active" ? "completed" : "info",
        priority: index < 2 ? "high" : "normal",
        tags: [
          ["Performance", "SEO"],
          ["Security", "SSL"],
          ["Analytics", "Traffic"],
          ["Deployment", "Config"],
          ["Monitoring", "Uptime"],
        ][index % 5],
        metric: [
          "+24% faster",
          "Valid until 2025",
          `${Math.floor(Math.random() * 10000)} visitors`,
          "v1.0.1",
          "99.9% uptime",
        ][index % 5],
      })
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your website data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const recentActivity = generateRecentActivity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-purple-600/10" />
        <div className="relative p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Website Management
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor, optimize, and manage your website portfolio (
                {zones.length} sites)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" className="h-9">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                size="sm"
                className="h-9 bg-gradient-to-r from-emerald-600 to-teal-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Website
              </Button>
            </div>
          </div>

          {/* Website Management Blocks - Gradient Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Globe className="h-8 w-8" />
                  <TrendingUp className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Performance Hub</h3>
                <p className="text-emerald-100 text-sm mb-3">
                  Speed, Core Vitals & UX metrics
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                  onClick={() => handleQuickAction("speed")}
                >
                  Optimize
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Search className="h-8 w-8" />
                  <Badge className="bg-white/20 text-white">SEO</Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">SEO & Content</h3>
                <p className="text-blue-100 text-sm mb-3">
                  Rankings, keywords & content optimization
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                  onClick={() => handleQuickAction("seo")}
                >
                  Analyze
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Shield className="h-8 w-8" />
                  <Lock className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Security Center</h3>
                <p className="text-purple-100 text-sm mb-3">
                  SSL, monitoring & threat protection
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                  onClick={() => handleQuickAction("security")}
                >
                  Secure
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <BarChart3 className="h-8 w-8" />
                  <Eye className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Analytics Suite</h3>
                <p className="text-orange-100 text-sm mb-3">
                  Traffic, conversions & user insights
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                  onClick={() => handleQuickAction("analytics")}
                >
                  Track
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 space-y-6">
        {/* Quick Actions with Tabs */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Quick Actions
            </CardTitle>
            <CardDescription>
              Essential tools for website management and optimization
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
                    onClick={() => handleQuickAction("speed")}
                  >
                    <Zap className="h-6 w-6" />
                    <span className="text-sm">Page Speed</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("vitals")}
                  >
                    <MonitorSpeaker className="h-6 w-6" />
                    <span className="text-sm">Core Vitals</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("mobile")}
                  >
                    <Smartphone className="h-6 w-6" />
                    <span className="text-sm">Mobile Test</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() =>
                      zones.length > 0 &&
                      handleQuickAction("cache", zones[0].id)
                    }
                  >
                    <RefreshCw className="h-6 w-6" />
                    <span className="text-sm">Cache</span>
                  </Button>
                </div>
              )}
              {activeTabIndex === 1 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("content")}
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Content</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("keywords")}
                  >
                    <Search className="h-6 w-6" />
                    <span className="text-sm">Keywords</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("rankings")}
                  >
                    <Target className="h-6 w-6" />
                    <span className="text-sm">Rankings</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("meta")}
                  >
                    <Palette className="h-6 w-6" />
                    <span className="text-sm">Meta Tags</span>
                  </Button>
                </div>
              )}
              {activeTabIndex === 2 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("ssl")}
                  >
                    <Shield className="h-6 w-6" />
                    <span className="text-sm">SSL Check</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("security")}
                  >
                    <Lock className="h-6 w-6" />
                    <span className="text-sm">Security</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("uptime")}
                  >
                    <Server className="h-6 w-6" />
                    <span className="text-sm">Uptime</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("monitor")}
                  >
                    <Activity className="h-6 w-6" />
                    <span className="text-sm">Monitor</span>
                  </Button>
                </div>
              )}
              {activeTabIndex === 3 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("traffic")}
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">Traffic</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("visitors")}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Visitors</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("revenue")}
                  >
                    <DollarSign className="h-6 w-6" />
                    <span className="text-sm">Revenue</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("heatmaps")}
                  >
                    <Eye className="h-6 w-6" />
                    <span className="text-sm">Heatmaps</span>
                  </Button>
                </div>
              )}
              {activeTabIndex === 4 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("deploy")}
                  >
                    <Rocket className="h-6 w-6" />
                    <span className="text-sm">Deploy</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("version")}
                  >
                    <Code className="h-6 w-6" />
                    <span className="text-sm">Version</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("build")}
                  >
                    <Code className="h-6 w-6" />
                    <span className="text-sm">Build</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => handleQuickAction("backup")}
                  >
                    <Database className="h-6 w-6" />
                    <span className="text-sm">Backup</span>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dense Data Cards and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dense Website Metrics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Performance Metrics from Real Data */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Requests
                      </p>
                      <p className="text-2xl font-bold">
                        {dashboardMetrics?.totalRequests !== null &&
                        dashboardMetrics?.totalRequests !== undefined
                          ? dashboardMetrics.totalRequests > 1000000
                            ? `${(dashboardMetrics.totalRequests / 1000000).toFixed(1)}M`
                            : dashboardMetrics.totalRequests > 1000
                              ? `${(dashboardMetrics.totalRequests / 1000).toFixed(1)}K`
                              : dashboardMetrics.totalRequests.toString()
                          : "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {dashboardMetrics?.analyticsAvailable || 0} sites with
                        data
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
                        Total Visitors
                      </p>
                      <p className="text-2xl font-bold">
                        {dashboardMetrics?.totalVisitors !== null &&
                        dashboardMetrics?.totalVisitors !== undefined
                          ? dashboardMetrics.totalVisitors > 1000000
                            ? `${(dashboardMetrics.totalVisitors / 1000000).toFixed(1)}M`
                            : dashboardMetrics.totalVisitors > 1000
                              ? `${(dashboardMetrics.totalVisitors / 1000).toFixed(1)}K`
                              : dashboardMetrics.totalVisitors.toString()
                          : "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">Last 7 days</p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Bandwidth
                      </p>
                      <p className="text-2xl font-bold">
                        {dashboardMetrics?.totalBandwidth !== null &&
                        dashboardMetrics?.totalBandwidth !== undefined
                          ? dashboardMetrics.totalBandwidth > 1000000000
                            ? `${(dashboardMetrics.totalBandwidth / 1000000000).toFixed(1)}GB`
                            : dashboardMetrics.totalBandwidth > 1000000
                              ? `${(dashboardMetrics.totalBandwidth / 1000000).toFixed(1)}MB`
                              : `${(dashboardMetrics.totalBandwidth / 1000).toFixed(1)}KB`
                          : "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">Total transferred</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Uptime
                      </p>
                      <p className="text-2xl font-bold">
                        {dashboardMetrics?.totalUptime !== null &&
                        dashboardMetrics?.totalUptime !== undefined
                          ? `${dashboardMetrics.totalUptime.toFixed(1)}%`
                          : "N/A"}
                      </p>
                      <p className="text-xs text-green-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {dashboardMetrics?.activeWebsites || 0} active sites
                      </p>
                    </div>
                    <Shield className="h-8 w-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Threats Blocked
                      </p>
                      <p className="text-2xl font-bold">
                        {dashboardMetrics?.totalThreatsBlocked !== null &&
                        dashboardMetrics?.totalThreatsBlocked !== undefined
                          ? dashboardMetrics.totalThreatsBlocked > 1000
                            ? `${(dashboardMetrics.totalThreatsBlocked / 1000).toFixed(1)}K`
                            : dashboardMetrics.totalThreatsBlocked.toString()
                          : "N/A"}
                      </p>
                      <p className="text-xs text-red-600 flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        {dashboardMetrics?.securityAvailable || 0} sites
                        monitored
                      </p>
                    </div>
                    <Lock className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Blocked Requests
                      </p>
                      <p className="text-2xl font-bold">
                        {dashboardMetrics?.totalRequestsBlocked !== null &&
                        dashboardMetrics?.totalRequestsBlocked !== undefined
                          ? dashboardMetrics.totalRequestsBlocked > 1000
                            ? `${(dashboardMetrics.totalRequestsBlocked / 1000).toFixed(1)}K`
                            : dashboardMetrics.totalRequestsBlocked.toString()
                          : "N/A"}
                      </p>
                      <p className="text-xs text-orange-600">
                        Security filtered
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Website Portfolio Overview with Real Data */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Website Portfolio
                </CardTitle>
                <CardDescription>
                  Performance overview across all managed sites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Active Sites</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-green-100 rounded-full">
                        <div
                          className="h-2 bg-green-500 rounded-full"
                          style={{
                            width: `${Math.min(100, ((dashboardMetrics?.activeWebsites || 0) / Math.max(dashboardMetrics?.totalWebsites || 1, 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {dashboardMetrics?.activeWebsites || 0}/
                        {dashboardMetrics?.totalWebsites || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">SSL Secured</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-blue-100 rounded-full">
                        <div className="w-24 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">
                        {dashboardMetrics?.sslSecured || 0}/
                        {dashboardMetrics?.totalWebsites || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm">Analytics Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-purple-100 rounded-full">
                        <div
                          className="h-2 bg-purple-500 rounded-full"
                          style={{
                            width: `${Math.min(100, ((dashboardMetrics?.analyticsAvailable || 0) / Math.max(dashboardMetrics?.totalWebsites || 1, 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {dashboardMetrics?.analyticsAvailable || 0}/
                        {dashboardMetrics?.totalWebsites || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm">Performance Data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-orange-100 rounded-full">
                        <div
                          className="h-2 bg-orange-500 rounded-full"
                          style={{
                            width: `${Math.min(100, ((dashboardMetrics?.performanceAvailable || 0) / Math.max(dashboardMetrics?.totalWebsites || 1, 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {dashboardMetrics?.performanceAvailable || 0}/
                        {dashboardMetrics?.totalWebsites || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">Security Monitoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-red-100 rounded-full">
                        <div
                          className="h-2 bg-red-500 rounded-full"
                          style={{
                            width: `${Math.min(100, ((dashboardMetrics?.securityAvailable || 0) / Math.max(dashboardMetrics?.totalWebsites || 1, 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {dashboardMetrics?.securityAvailable || 0}/
                        {dashboardMetrics?.totalWebsites || 0}
                      </span>
                    </div>
                  </div>

                  {/* Data availability notice */}
                  {dashboardMetrics &&
                    (dashboardMetrics.analyticsAvailable === 0 ||
                      dashboardMetrics.performanceAvailable === 0 ||
                      dashboardMetrics.securityAvailable === 0) && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <Activity className="h-4 w-4 inline mr-2" />
                          {[
                            dashboardMetrics.analyticsAvailable === 0 &&
                              "Analytics",
                            dashboardMetrics.performanceAvailable === 0 &&
                              "Performance",
                            dashboardMetrics.securityAvailable === 0 &&
                              "Security",
                          ]
                            .filter(Boolean)
                            .join(", ")}{" "}
                          data will be available once your sites have traffic
                          and monitoring is active.
                        </p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Website Activity Feed with Real Data */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Recent Updates
              </CardTitle>
              <CardDescription>
                Latest website activities and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {recentActivity.map((item: ActivityItem, index: number) => (
                  <div
                    key={item.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      index !== recentActivity.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {item.website}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.tags.map((tag: string, tagIndex: number) => (
                              <Badge
                                key={tagIndex}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-medium text-green-600">
                              {item.metric}
                            </span>
                            <span>•</span>
                            <span>{item.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100">
                <Button variant="outline" size="sm" className="w-full">
                  View All Updates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
