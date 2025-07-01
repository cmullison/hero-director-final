import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Tabs from "@/components/ui/tabs";
import { UsageOverTime } from "@/pages/usage/usage-over-time";
import { CreditUsage } from "@/pages/usage/credit-usage";
import { UsageTable } from "@/pages/usage/usage-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const usagePageTabs = ["Overview", "Credits", "Details"];

export default function UsagePage() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-primary">
          Usage
        </h2>
        <div className="flex items-center gap-2">
          <Select defaultValue="30days">
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-9">
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Credits Used
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
            <div className="text-lg sm:text-2xl font-bold">12,543</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              +2,350 from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Remaining Credits
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
            <div className="text-lg sm:text-2xl font-bold">87,457</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              87% of allocation
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Daily Average
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
            <div className="text-lg sm:text-2xl font-bold">418</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              +22 from last week
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Projected Usage
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
            <div className="text-lg sm:text-2xl font-bold">+12,540</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        tabs={usagePageTabs}
        onTabChange={handleTabChange}
        initialActiveIndex={activeTabIndex}
      />

      <div className="space-y-4">
        {activeTabIndex === 0 && (
          <Card className="overflow-hidden border rounded-lg">
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle>Usage Over Time</CardTitle>
              <CardDescription>
                Your daily AI usage over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-0 sm:pl-2">
              <UsageOverTime />
            </CardContent>
          </Card>
        )}
        {activeTabIndex === 1 && (
          <Card className="overflow-hidden border rounded-lg">
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle>Credit Usage by Model</CardTitle>
              <CardDescription>
                How your credits are distributed across different AI models
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <CreditUsage />
            </CardContent>
          </Card>
        )}
        {activeTabIndex === 2 && (
          <Card className="overflow-hidden border rounded-lg">
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle>Detailed Usage</CardTitle>
              <CardDescription>
                Breakdown of your AI usage by date, model, and project
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <UsageTable />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
