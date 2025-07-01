import { useState } from "react";
import { CaretDown, Check } from "@phosphor-icons/react";
import { Button } from "@/components/chat/button/Button";
import { Card } from "@/components/chat/card/Card";
import { Tooltip } from "@/components/chat/tooltip/Tooltip";
import { APPROVAL } from "../../../shared";
import { Clock } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  toolCallId: string;
  state: "call" | "result" | "partial-call";
  step?: number;
  args: Record<string, unknown>;
  result?:
    | string
    | {
        content?: Array<{ type: string; text: string }>;
      };
}

interface ToolInvocationCardProps {
  toolInvocation: ToolInvocation;
  toolCallId: string;
  needsConfirmation: boolean;
  addToolResult: (args: { toolCallId: string; result: string }) => void;
}

// Helper function to detect if a string contains image URLs
const isImageUrl = (text: string): boolean => {
  // More comprehensive pattern to catch various image URL formats
  const imageUrlPattern =
    /https?:\/\/[^\s\n]+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s\n]*)?/i;
  // Also check for URLs that might not have file extensions but are from known image services
  const imageServicePattern =
    /https?:\/\/(.*\.)?(replicate\.delivery|amazonaws\.com|cloudfront\.net|imgur\.com|unsplash\.com)[^\s\n]*/i;
  return imageUrlPattern.test(text) || imageServicePattern.test(text);
};

// Helper function to extract image URLs from text
const extractImageUrls = (text: string): string[] => {
  const imageUrlPattern =
    /https?:\/\/[^\s\n]+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s\n]*)?/gi;
  const imageServicePattern =
    /https?:\/\/(.*\.)?(replicate\.delivery|amazonaws\.com|cloudfront\.net|imgur\.com|unsplash\.com)[^\s\n]*/gi;

  const extensionUrls = text.match(imageUrlPattern) || [];
  const serviceUrls = text.match(imageServicePattern) || [];

  // Combine and deduplicate URLs
  const allUrls = [...extensionUrls, ...serviceUrls];
  return [...new Set(allUrls)];
};

export function ToolInvocationCard({
  toolInvocation,
  toolCallId,
  needsConfirmation,
  addToolResult,
}: ToolInvocationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper function to render the result content
  const renderResult = () => {
    const result = toolInvocation.result;

    if (typeof result === "string") {
      // Handle direct string results (like from generateImage)
      if (isImageUrl(result)) {
        const urls = extractImageUrls(result);
        return (
          <div className="space-y-2">
            {urls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Generated image ${index + 1}`}
                  className="max-w-full h-auto rounded-md border"
                  style={{ maxHeight: "150px" }}
                  onError={(e) => {
                    console.error(`Failed to load image: ${url}`);
                    e.currentTarget.style.display = "none";
                    const errorDiv = e.currentTarget
                      .nextElementSibling as HTMLElement;
                    if (errorDiv) {
                      errorDiv.style.display = "block";
                    }
                  }}
                />
                <div
                  style={{ display: "none" }}
                  className="text-xs text-muted-foreground p-2 bg-background/80 rounded-md"
                >
                  Failed to load image: {url}
                </div>
              </div>
            ))}
          </div>
        );
      } else {
        return <pre className="whitespace-pre-wrap break-words">{result}</pre>;
      }
    }

    if (typeof result === "object" && result.content) {
      const contentText = result.content
        .map((item: { type: string; text: string }) => {
          if (item.type === "text" && item.text.startsWith("\n~ Page URL:")) {
            const lines = item.text.split("\n").filter(Boolean);
            return lines
              .map((line: string) => `- ${line.replace("\n~ ", "")}`)
              .join("\n");
          }
          return item.text;
        })
        .join("\n");

      // Check if the content contains image URLs
      if (isImageUrl(contentText)) {
        const urls = extractImageUrls(contentText);
        return (
          <div className="space-y-2">
            {urls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Generated image ${index + 1}`}
                  className="max-w-full h-auto rounded-md border"
                  style={{ maxHeight: "150px" }}
                  onError={(e) => {
                    console.error(`Failed to load image: ${url}`);
                    e.currentTarget.style.display = "none";
                    const errorDiv = e.currentTarget
                      .nextElementSibling as HTMLElement;
                    if (errorDiv) {
                      errorDiv.style.display = "block";
                    }
                  }}
                />
                <div
                  style={{ display: "none" }}
                  className="text-xs text-muted-foreground p-2 bg-background/80 rounded-md"
                >
                  Failed to load image: {url}
                </div>
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <pre className="whitespace-pre-wrap break-words">{contentText}</pre>
        );
      }
    }

    return (
      <pre className="whitespace-pre-wrap break-words">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  };

  return (
    <Card
      className={`p-3 my-2 w-full max-w-[500px] rounded-md bg-card dark:bg-card ${
        needsConfirmation ? "border-primary/30" : "border-muted"
      } overflow-hidden`}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 cursor-pointer"
      >
        <div
          className={`${needsConfirmation ? "bg-primary/10" : "bg-secondary/20"} p-1.5 rounded-full flex-shrink-0`}
        >
          <Clock
            size={14}
            className={
              needsConfirmation ? "text-primary" : "text-muted-foreground"
            }
          />
        </div>
        <h4 className="font-medium flex items-center gap-2 flex-1 text-left">
          {toolInvocation.toolName === "scheduleTask"
            ? "Set reminder..."
            : toolInvocation.toolName === "getLocalTime"
              ? "Get local time..."
              : toolInvocation.toolName === "getWeatherInformation"
                ? "Get weather..."
                : toolInvocation.toolName === "getScheduledTasks"
                  ? "Get scheduled tasks..."
                  : toolInvocation.toolName === "cancelScheduledTask"
                    ? "Cancel scheduled task..."
                    : toolInvocation.toolName === "generateImage"
                      ? "Generate image..."
                      : toolInvocation.toolName}
          {!needsConfirmation && toolInvocation.state === "result" && (
            <span className="text-xs text-primary/70">✓ Completed</span>
          )}
        </h4>
        <CaretDown
          size={14}
          className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`transition-all duration-200 ${isExpanded ? "max-h-[400px] opacity-100 mt-3" : "max-h-0 opacity-0 overflow-hidden"}`}
      >
        <div
          className="overflow-y-auto"
          style={{ maxHeight: isExpanded ? "380px" : "0px" }}
        >
          <div className="mb-3">
            <h5 className="text-xs font-medium mb-1 text-muted-foreground">
              Arguments:
            </h5>
            <pre className="bg-background/80 p-2 rounded-md text-xs overflow-auto whitespace-pre-wrap break-words max-w-[450px]">
              {JSON.stringify(toolInvocation.args, null, 2)}
            </pre>
          </div>

          {needsConfirmation && toolInvocation.state === "call" && (
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  addToolResult({
                    toolCallId,
                    result: APPROVAL.NO,
                  })
                }
              >
                Reject
              </Button>
              <Tooltip content={"Accept action"}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    addToolResult({
                      toolCallId,
                      result: APPROVAL.YES,
                    })
                  }
                >
                  Approve
                </Button>
              </Tooltip>
            </div>
          )}

          {!needsConfirmation && toolInvocation.state === "result" && (
            <div className="mt-3 border-t border-muted pt-3">
              <h5 className="text-xs font-medium mb-1 text-muted-foreground">
                Result:
              </h5>
              <div className="bg-background/80 p-2 rounded-md text-xs overflow-auto max-w-[450px]">
                {renderResult()}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
