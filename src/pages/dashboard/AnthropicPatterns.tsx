import { useEffect, useState, useMemo, useCallback } from "react";
import { useAgent } from "agents/react";

import sequentialCode from "@/assets/anthropic-patterns/01 sequential.txt?raw";
import routingCode from "@/assets/anthropic-patterns/02 routing.txt?raw";
import parallelCode from "@/assets/anthropic-patterns/03 parallel.txt?raw";
import orchestratorCode from "@/assets/anthropic-patterns/04 orchestrator.txt?raw";
import evaluatorCode from "@/assets/anthropic-patterns/05 evaluator.txt?raw";

import { nanoid } from "nanoid";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Tabs from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

type ToastType = "success" | "error" | "info";

type WorkflowStatus = {
  isRunning: boolean;
  output: string;
};

type WorkflowType =
  | "sequential"
  | "routing"
  | "parallel"
  | "orchestrator"
  | "evaluator";

type PatternProps = {
  type: WorkflowType;
  title: string;
  description: string;
  image: string;
  code: string;
  index: number;
};

type FormState = {
  sequential: { input: string };
  routing: { query: string };
  parallel: { code: string };
  orchestrator: { featureRequest: string };
  evaluator: { text: string; targetLanguage: string };
};

const LANGUAGES = [
  { value: "french", label: "French" },
  { value: "spanish", label: "Spanish" },
  { value: "japanese", label: "Japanese" },
  { value: "german", label: "German" },
  { value: "mandarin", label: "Mandarin Chinese" },
  { value: "arabic", label: "Arabic" },
  { value: "russian", label: "Russian" },
  { value: "italian", label: "Italian" },
  { value: "klingon", label: "Klingon" },
  { value: "portuguese", label: "Portuguese" },
] as const;

function getOrCreateSessionId() {
  const stored = globalThis.localStorage?.getItem("sessionId");
  if (stored) return stored;

  const newId = nanoid(8);
  globalThis.localStorage?.setItem("sessionId", newId);
  return newId;
}

const patternTabs = ["Diagram", "Code"];

function PatternSection({
  type,
  title,
  description,
  image,
  code,
  index,
  sessionId,
}: PatternProps & { sessionId: string }) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const socket = useAgent({
    prefix: "agents",
    agent: type,
    name: sessionId,
    onMessage: (e) => {
      const data = JSON.parse(e.data);
      switch (data.type) {
        case "status":
          setWorkflowStatus(data.status);
          break;
        case "toast": {
          const toastFn = toast[data.toast.type as ToastType] || toast;
          toastFn(data.toast.message);
          break;
        }
      }
    },
  });

  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>({
    isRunning: false,
    output: "",
  });

  const [formState, setFormState] = useState<FormState[typeof type]>(() => {
    switch (type) {
      case "sequential":
        return { input: "Our new AI-powered productivity app" };
      case "routing":
        return { query: "How do I reset my password?" };
      case "parallel":
        return {
          code: `function processUserData(data) {\n  // TODO: Add validation\n  database.save(data);\n  return true;\n}`,
        };
      case "orchestrator":
        return {
          featureRequest:
            "Add dark mode support to the dashboard, including theme persistence and system preference detection",
        };
      case "evaluator":
        return {
          text: "The early bird catches the worm",
          targetLanguage: LANGUAGES[0].value,
        };
    }
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const getFormContent = () => {
    if (type === "sequential") {
      const state = formState as FormState["sequential"];
      return (
        <div className="space-y-2">
          <Label htmlFor="sequential-input">Marketing Copy Input</Label>
          <Input
            id="sequential-input"
            type="text"
            name="input"
            value={state.input}
            onChange={handleInputChange}
            placeholder="e.g., 'Our new AI-powered productivity app'"
          />
          <p className="text-sm text-muted-foreground">
            Enter a product or service to generate marketing copy for.
          </p>
        </div>
      );
    }

    if (type === "routing") {
      const state = formState as FormState["routing"];
      return (
        <div className="space-y-2">
          <Label htmlFor="routing-query">Customer Query</Label>
          <Input
            id="routing-query"
            type="text"
            name="query"
            value={state.query}
            onChange={handleInputChange}
            placeholder="e.g., 'How do I reset my password?'"
          />
          <p className="text-sm text-muted-foreground">
            Enter a customer support question to be routed.
          </p>
        </div>
      );
    }

    if (type === "parallel") {
      const state = formState as FormState["parallel"];
      return (
        <div className="space-y-2">
          <Label htmlFor="parallel-code">Code for Review</Label>
          <Textarea
            id="parallel-code"
            name="code"
            value={state.code}
            onChange={handleInputChange}
            placeholder="Enter code snippet..."
            className="font-mono"
            rows={6}
          />
          <p className="text-sm text-muted-foreground">
            Enter code for parallel security, performance, and maintainability
            review.
          </p>
        </div>
      );
    }

    if (type === "orchestrator") {
      const state = formState as FormState["orchestrator"];
      return (
        <div className="space-y-2">
          <Label htmlFor="orchestrator-request">Feature Request</Label>
          <Textarea
            id="orchestrator-request"
            name="featureRequest"
            value={state.featureRequest}
            onChange={handleInputChange}
            placeholder="Enter a feature request..."
            rows={6}
          />
          <p className="text-sm text-muted-foreground">
            Describe the feature to be implemented across multiple files.
          </p>
        </div>
      );
    }

    if (type === "evaluator") {
      const state = formState as FormState["evaluator"];
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="evaluator-text">Text to Translate</Label>
            <Textarea
              id="evaluator-text"
              name="text"
              value={state.text}
              onChange={handleInputChange}
              placeholder="e.g., 'The early bird catches the worm'"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="evaluator-language">Target Language</Label>
            <Select
              name="targetLanguage"
              value={state.targetLanguage}
              onValueChange={(value) =>
                handleSelectChange("targetLanguage", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }
  };

  const formatOutput = (output: string) => {
    try {
      const parsed = JSON.parse(output);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return output;
    }
  };

  const runWorkflow = async () => {
    try {
      socket.send(
        JSON.stringify({
          type: "run",
          input: formState,
        })
      );
      toast.info(`Started ${title} workflow...`);
    } catch (error) {
      toast.error(`Failed to start ${title} workflow`);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>
          {index + 1}. {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Tabs
            tabs={patternTabs}
            onTabChange={setActiveTabIndex}
            initialActiveIndex={activeTabIndex}
          />
          <div className="mt-4">
            {activeTabIndex === 0 && (
              <div className="p-4 border rounded-lg bg-muted">
                <img
                  src={image}
                  alt={`${title} workflow diagram`}
                  className="rounded-md"
                />
              </div>
            )}
            {activeTabIndex === 1 && (
              <Card className="h-full">
                <CardContent className="p-0">
                  <pre className="p-4 text-sm font-mono overflow-auto max-h-[400px] rounded-lg bg-muted">
                    <code>{code}</code>
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
            </CardHeader>
            <CardContent>{getFormContent()}</CardContent>
            <CardFooter>
              <Button
                onClick={runWorkflow}
                disabled={workflowStatus.isRunning}
                className="w-full"
              >
                {workflowStatus.isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  "Run Workflow"
                )}
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Output</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 text-sm font-mono overflow-auto bg-muted rounded-lg min-h-[100px]">
                <code>
                  {workflowStatus.output
                    ? formatOutput(workflowStatus.output)
                    : "Output will appear here..."}
                </code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnthropicPatterns() {
  const sessionId = useMemo(() => getOrCreateSessionId(), []);

  const patterns = {
    sequential: {
      title: "Prompt Chaining",
      description:
        "Decomposes tasks into a sequence of steps, where each LLM call processes the output of the previous one.",
      image: "/anthropic-patterns/01 sequential.png",
      code: sequentialCode,
    },
    routing: {
      title: "Routing",
      description:
        "Classifies input and directs it to specialized followup tasks, allowing for separation of concerns.",
      image: "/anthropic-patterns/02 routing.png",
      code: routingCode,
    },
    parallel: {
      title: "Parallelization",
      description:
        "Enables simultaneous task processing through sectioning or voting mechanisms.",
      image: "/anthropic-patterns/03 parallel.png",
      code: parallelCode,
    },
    orchestrator: {
      title: "Orchestrator-Workers",
      description:
        "A central LLM dynamically breaks down tasks, delegates to worker LLMs, and synthesizes results.",
      image: "/anthropic-patterns/04 orchestrator.png",
      code: orchestratorCode,
    },
    evaluator: {
      title: "Evaluator-Optimizer",
      description:
        "One LLM generates responses while another provides evaluation and feedback in a loop.",
      image: "/anthropic-patterns/05 evaluator.png",
      code: evaluatorCode,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-background to-accent/95">
      <div className="p-6 space-y-6">
        <Toaster />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              Building Effective Agents
            </h1>
            <p className="text-muted-foreground mt-1">
              Common patterns for implementing AI agents using Cloudflare
              Workers.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {(Object.keys(patterns) as WorkflowType[]).map((type, index) => {
            const pattern = patterns[type];
            return (
              <PatternSection
                key={type}
                type={type}
                title={pattern.title}
                description={pattern.description}
                image={pattern.image}
                code={pattern.code}
                index={index}
                sessionId={sessionId}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
