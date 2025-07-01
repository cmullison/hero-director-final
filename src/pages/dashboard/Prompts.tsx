import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import Tabs from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUp,
  Bookmark,
  Edit,
  Grid,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import React, { useState } from "react";

const tagsData = [
  { id: "sentiment-analysis", label: "Sentiment analysis", count: 1 },
  { id: "text-classification", label: "Text classification", count: 1 },
  { id: "social-media-monitoring", label: "Social media monitoring", count: 1 },
  { id: "creative-writing", label: "Creative writing", count: 1 },
  { id: "story-ideas", label: "Story ideas", count: 1 },
  { id: "data-visualization", label: "Data visualization", count: 1 },
  { id: "chart-recommendation", label: "Chart recommendation", count: 1 },
  { id: "data-analysis", label: "Data analysis", count: 1 },
  { id: "technical-documentation", label: "Technical documentation", count: 1 },
  { id: "code-documentation", label: "Code documentation", count: 1 },
  { id: "software-development", label: "Software development", count: 2 },
  { id: "interview-questions", label: "Interview questions", count: 1 },
  { id: "recruitment", label: "Recruitment", count: 1 },
  { id: "hr", label: "Hr", count: 1 },
  { id: "product-description", label: "Product description", count: 1 },
  { id: "e-commerce", label: "E Commerce", count: 1 },
  { id: "content-optimization", label: "Content optimization", count: 1 },
  { id: "academic-research", label: "Academic research", count: 1 },
  { id: "paper-summary", label: "Paper summary", count: 1 },
  { id: "literature-review", label: "Literature review", count: 1 },
  { id: "code-refactoring", label: "Code refactoring", count: 1 },
  { id: "code-quality", label: "Code quality", count: 1 },
  { id: "fitness", label: "Fitness", count: 1 },
  { id: "workout-plan", label: "Workout plan", count: 1 },
  { id: "personal-training", label: "Personal training", count: 1 },
  { id: "environmental-impact", label: "Environmental impact", count: 1 },
  { id: "sustainability", label: "Sustainability", count: 1 },
  { id: "carbon-footprint", label: "Carbon Footprint", count: 1 },
  { id: "agents", label: "Agents", count: 1 },
  { id: "interacting-with-apis", label: "Interacting with apis", count: 1 },
];

const promptsData = [
  {
    id: "1",
    title: "Environmental Impact Calculator",
    description:
      "Estimate the environmental impact of various activities or products based on user input.",
    tags: ["Environmental Impact", "Sustainability", "Carbon Footprint"],
    lastUpdated: "last year",
    bookmarked: false,
  },
  {
    id: "2",
    title: "Personalized Fitness Plan Generator",
    description:
      "Create customized workout plans based on user goals, fitness level, and available equipment.",
    tags: ["Fitness", "Workout Plan", "Personal Training"],
    lastUpdated: "last year",
    bookmarked: true,
  },
  {
    id: "3",
    title: "Code Refactoring Advisor",
    description:
      "Analyze code snippets and provide suggestions for improving code quality, readability, and efficiency.",
    tags: ["Code Refactoring", "Code Quality", "Software Development"],
    lastUpdated: "last year",
    bookmarked: false,
  },
  {
    id: "4",
    title: "Academic Research Paper Summarizer",
    description:
      "Provide concise summaries of academic papers, highlighting key findings and methodologies.",
    tags: ["Academic Research", "Paper Summary", "Literature Review"],
    lastUpdated: "last year",
    bookmarked: false,
  },
  {
    id: "5",
    title: "Product Description Optimizer",
    description:
      "Enhance product descriptions for e-commerce platforms, focusing on key features and benefits.",
    tags: ["Product Description", "E-commerce", "Content Optimization"],
    lastUpdated: "last year",
    bookmarked: true,
  },
  {
    id: "6",
    title: "Interview Question Generator",
    description:
      "Generate relevant interview questions based on a job description and required skills.",
    tags: ["Interview Questions", "Recruitment", "HR"],
    lastUpdated: "last year",
    bookmarked: false,
  },
  {
    id: "7",
    title: "Technical Documentation Generator",
    description:
      "Create clear and concise technical documentation for software projects based on code snippets and brief descriptions.",
    tags: [
      "Technical Documentation",
      "Code Documentation",
      "Software Development",
    ],
    lastUpdated: "last year",
    bookmarked: false,
  },
];

const TagsSidebar = ({ isOpen }: { isOpen: boolean }) => {
  if (!isOpen) return null;

  return (
    <div className="w-72 border-r bg-white flex flex-col">
      <div className="p-4 border-b flex justify-between items-center h-16">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Tags</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {tagsData.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox id={tag.id} className="rounded" />
                <label
                  htmlFor={tag.id}
                  className="ml-3 text-sm font-medium text-gray-700"
                >
                  {tag.label}
                </label>
              </div>
              <span className="text-xs text-gray-400">{tag.count}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t flex justify-between items-center">
        <Button variant="ghost" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const PromptCard = ({ prompt, onBookmark, isBookmarked }: any) => {
  return (
    <Card className="bg-white hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex space-x-2 mb-3">
          {prompt.tags.map((tag: string) => (
            <div
              key={tag}
              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
            >
              {tag}
            </div>
          ))}
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{prompt.title}</h3>
        <p className="text-sm text-gray-500 mb-4">{prompt.description}</p>
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-400">Prompt • last year</p>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-600">
              Test prompt{" "}
              <span className="ml-1" aria-hidden="true">
                →
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => onBookmark(prompt.id)}
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? "fill-current text-blue-600" : "text-gray-400"}`}
              />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PromptsList = ({ onSidebarToggle }: { onSidebarToggle: () => void }) => {
  const [bookmarked, setBookmarked] = useState(
    new Set(promptsData.filter((p) => p.bookmarked).map((p) => p.id))
  );
  const [activeTab, setActiveTab] = useState(0);

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const bookmarkedPrompts = promptsData.filter((p) => bookmarked.has(p.id));
  const promptsToDisplay = activeTab === 0 ? promptsData : bookmarkedPrompts;

  return (
    <div className="flex-1 border-r bg-gray-50 flex flex-col">
      <div className="p-4 border-b bg-white flex justify-between items-center h-16">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="mr-2"
          >
            <Grid className="w-5 h-5" />
          </Button>
          <Button variant="default">
            <Plus className="w-4 h-4 mr-2" />
            New prompt
          </Button>
        </div>
        <div className="flex items-center">
          <Tabs
            tabs={[
              "All",
              { label: "Bookmarked", icon: <Bookmark className="w-3 h-3" /> },
            ]}
            onTabChange={setActiveTab}
            hasBottomBorder={false}
          />
        </div>
      </div>
      <div className="p-4 border-b bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search" className="pl-9" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {promptsToDisplay.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onBookmark={toggleBookmark}
              isBookmarked={bookmarked.has(prompt.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const AgentPanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="w-[500px] bg-white flex flex-col">
      <div className="p-4 border-b flex justify-between items-center h-16">
        <h1 className="text-xl font-bold">Agents</h1>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base">Cult Prompt Stash</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Tabs
              tabs={["About", "Features", "Security"]}
              onTabChange={setActiveTab}
              isCentered
            />
            <div className="pt-4 text-sm text-gray-600">
              {activeTab === 0 &&
                "Prompt Stash is a local-first template built for storing and crafting prompts. Inspired by the anthropic prompt eval tool."}
              {activeTab === 1 && "Features content goes here."}
              {activeTab === 2 && "Security content goes here."}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Prompt Agent</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Enable AI Actions</span>
              <Switch />
            </div>
          </div>
          <p className="text-sm text-gray-500">Enabled Agent Tools</p>
          <p className="text-sm text-gray-400">
            Use @ to select AI actions (all are on by default)
          </p>

          <div className="relative">
            <Textarea
              placeholder="Send a message"
              className="pr-10 min-h-[80px]"
            />
            <div className="absolute bottom-2 right-2 flex items-center">
              <Button type="submit" size="icon" className="w-8 h-8">
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
            <div className="absolute bottom-2 left-2 flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-8 h-8"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPrompts() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      <div
        className={`${isSidebarOpen ? "w-72" : "w-0"} transition-all duration-300 bg-white overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b flex justify-between items-center h-16">
          <h2 className="text-lg font-semibold">Tags</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {tagsData.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox id={`sidebar-${tag.id}`} className="rounded" />
                  <label
                    htmlFor={`sidebar-${tag.id}`}
                    className="ml-3 text-sm font-medium text-gray-700"
                  >
                    {tag.label}
                  </label>
                </div>
                <span className="text-xs text-gray-400">{tag.count}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t flex space-x-2">
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-w-0">
        <PromptsList onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <AgentPanel />
      </div>
    </div>
  );
}
