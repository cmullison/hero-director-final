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
import { AnalyticsChart } from "@/pages/analytics/analytics-chart";
import { ModelComparisonChart } from "@/pages/analytics/model-comparison-chart";
import { UsageByCategory } from "@/pages/analytics/usage-by-category";
import { TopProjects } from "@/pages/analytics/top-projects";

const analyticsPageTabs = [
  "Overview",
  "Model Performance",
  "Usage by Category",
  "Top Projects",
  "Cost Analysis",
  "Error Breakdown",
];

export default function AnalyticsPage() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        {/* keep text-primary */}
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-primary">
          Project Analytics
        </h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-9">
            Export Data
          </Button>
          <Button size="sm" className="h-9">
            Custom Report
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Requests
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-lg sm:text-2xl font-bold">24,685</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Average Response Time
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-lg sm:text-2xl font-bold">1.2s</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              -0.3s from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Success Rate
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-lg sm:text-2xl font-bold">99.8%</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              +0.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Active Users
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-lg sm:text-2xl font-bold">+573</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              +48 since yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        tabs={analyticsPageTabs}
        onTabChange={handleTabChange}
        initialActiveIndex={activeTabIndex}
      />

      <div className="space-y-4">
        {activeTabIndex === 0 && (
          <Card className="overflow-hidden border rounded-lg">
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle>Usage Trends</CardTitle>
              <CardDescription>
                Your AI usage over the past 30 days
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-0 sm:pl-2">
              <AnalyticsChart />
            </CardContent>
          </Card>
        )}
        {activeTabIndex === 1 && (
          <Card className="overflow-hidden border rounded-lg">
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle>Model Performance Comparison</CardTitle>
              <CardDescription>
                Response time and accuracy by model
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <ModelComparisonChart />
            </CardContent>
          </Card>
        )}
        {activeTabIndex === 2 && (
          <Card className="overflow-hidden border rounded-lg">
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle>Usage by Category</CardTitle>
              <CardDescription>
                Distribution of AI usage across different categories
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <UsageByCategory />
            </CardContent>
          </Card>
        )}
        {activeTabIndex === 3 && (
          <Card className="overflow-hidden border rounded-lg">
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle>Top Projects</CardTitle>
              <CardDescription>Your most active AI projects</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <TopProjects />
            </CardContent>
          </Card>
        )}
        {activeTabIndex === 4 && (
          <Card className="overflow-hidden border rounded-lg">
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle>Cost Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of your AI expenditure
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <p className="text-muted-foreground text-sm">
                Cost analysis content goes here. (e.g., charts, tables detailing
                costs by model, provider, project)
              </p>
            </CardContent>
          </Card>
        )}
        {activeTabIndex === 5 && (
          <Card className="overflow-hidden border rounded-lg">
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle>Error Breakdown</CardTitle>
              <CardDescription>Analysis of errors and failures</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <p className="text-muted-foreground text-sm">
                Error breakdown content goes here. (e.g., error rate trends,
                common error types, affected services)
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
