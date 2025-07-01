"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Tabs from "@/components/ui/tabs";
import { Bot, Code, History, Lightbulb, Search, Wand2 } from "lucide-react";
import { Input } from "./ui/input";

export function AIAssistantPanel() {
  const [query, setQuery] = useState("");

  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
  };

  return (
    <div className="pt-4 space-y-4">
      <div className="px-4">
        <h3 className="flex items-center gap-1 text-sm font-medium">
          <Bot className="h-4 w-4" />
          AI Assistant
        </h3>
        <p className="text-xs text-muted-foreground">Get help with your code</p>
      </div>
      <div className="relative px-4">
        <Input
          type="text"
          placeholder="Ask AI anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-8"
        />
        <Button
          className="absolute right-4 top-0 hover:bg-transparent active:bg-transparent disabled:bg-transparent"
          variant="ghost"
          size="icon"
          disabled={!query}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-2 mx-auto border-b border-border">
        <Tabs
          iconOnly={true}
          isCentered={true}
          tabs={[
            { label: "Suggestions", icon: <Lightbulb /> },
            { label: "Tools", icon: <Wand2 /> },
            { label: "History", icon: <History /> },
          ]}
          onTabChange={handleTabChange}
          initialActiveIndex={activeTabIndex}
        />
      </div>
      {activeTabIndex === 0 && (
        <div className="mt-2 px-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-xs h-auto py-2"
          >
            <Wand2 className="mr-2 h-3 w-3" />
            Generate Code
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-xs h-auto py-2"
          >
            <Code className="mr-2 h-3 w-3" />
            Refactor Code
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-xs h-auto py-2"
          >
            <Search className="mr-2 h-3 w-3" />
            Analyze Performance
          </Button>
        </div>
      )}
      {activeTabIndex === 1 && (
        <div className="mt-2 px-4 space-y-2">
          <div className="text-center text-xs text-muted-foreground py-4">
            No recent queries
          </div>
        </div>
      )}
      {activeTabIndex === 2 && (
        <div className="mt-2 px-4 space-y-2">
          <div className="text-center text-xs text-muted-foreground py-4">
            No recent queries
          </div>
        </div>
      )}

      <div className="hidden rounded-md bg-muted mx-4 p-3">
        <h4 className="text-xs font-medium">Pro Tip</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Use AI to generate code, find bugs, and get suggestions for
          improvements. Upgrade to Pro for advanced AI features.
        </p>
        <Button variant="default" size="sm" className="mt-2 w-full text-xs">
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
}
