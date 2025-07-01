"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Loader2,
  Play,
  RefreshCw,
  Video,
  X,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface VideoJob {
  id: string;
  userId: string;
  prompt: string;
  model: string;
  aspect_ratio: string;
  seed?: number;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  replicate_prediction_id?: string;
  video_url?: string;
  error_message?: string;
  settings?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface VideoGeneratorProps {
  seed?: number;
}

export function VideoGenerator({ seed }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoJobs, setVideoJobs] = useState<VideoJob[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load existing jobs on component mount
  useEffect(() => {
    loadVideoJobs();
  }, []);

  // Poll for job updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      updateJobStatuses();
    }, 10000);

    return () => clearInterval(interval);
  }, [videoJobs]);

  const loadVideoJobs = async () => {
    try {
      const response = await fetch("/api/video-jobs", {
        credentials: "include", // This ensures cookies are sent
      });

      if (response.ok) {
        const data = (await response.json()) as {
          success: boolean;
          jobs?: VideoJob[];
        };
        setVideoJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Failed to load video jobs:", error);
    }
  };

  const updateJobStatuses = async () => {
    const processingJobs = videoJobs.filter(
      (job) => job.status === "pending" || job.status === "processing"
    );

    for (const job of processingJobs) {
      try {
        const response = await fetch(`/api/video-jobs/${job.id}`, {
          credentials: "include", // This ensures cookies are sent
        });

        if (response.ok) {
          const data = (await response.json()) as {
            success: boolean;
            job?: VideoJob;
          };
          if (data.job) {
            setVideoJobs((prev) =>
              prev.map((j) => (j.id === job.id ? data.job! : j))
            );
          }
        }
      } catch (error) {
        console.error(`Failed to update job ${job.id}:`, error);
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // This ensures cookies are sent
        body: JSON.stringify({
          prompt: prompt.trim(),
          ...(seed !== undefined && { seed }),
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          success: boolean;
          job?: VideoJob;
          error?: string;
        };
        if (data.success && data.job) {
          setVideoJobs((prev) => [data.job!, ...prev]);
          setPrompt("");
        } else {
          setError(data.error || "Failed to start video generation");
        }
      } else {
        const data = (await response.json()) as { error?: string };
        setError(data.error || "Failed to start video generation");
      }
    } catch (error) {
      console.error("Error starting video generation:", error);
      setError("Network error while starting video generation");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/video-jobs/${jobId}/cancel`, {
        method: "POST",
        credentials: "include", // This ensures cookies are sent
      });

      if (response.ok) {
        const data = (await response.json()) as {
          success: boolean;
          job?: VideoJob;
        };
        if (data.job) {
          setVideoJobs((prev) =>
            prev.map((j) => (j.id === jobId ? data.job! : j))
          );
        }
      }
    } catch (error) {
      console.error("Failed to cancel job:", error);
    }
  };

  const getStatusIcon = (status: VideoJob["status"]) => {
    switch (status) {
      case "pending":
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: VideoJob["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Describe the video you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px]"
        />
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setPrompt("")}
            disabled={!prompt || isGenerating}
          >
            Clear
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>

      {videoJobs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Video Generation Jobs</h3>
          <div className="space-y-3">
            {videoJobs.map((job) => (
              <Card key={job.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(job.status)}>
                        {getStatusIcon(job.status)}
                        <span className="ml-1 capitalize">{job.status}</span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {job.prompt}
                    </p>
                    {job.error_message && (
                      <p className="text-sm text-red-600 mb-2">
                        Error: {job.error_message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {(job.status === "pending" ||
                      job.status === "processing") && (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelJob(job.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}

                    {job.status === "completed" && job.video_url && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(job.video_url, "_blank")}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = job.video_url!;
                            a.download = `video-${job.id}.mp4`;
                            a.click();
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {job.status === "completed" && job.video_url && (
                  <div className="mt-3">
                    <video
                      controls
                      className="w-full max-w-md rounded-lg"
                      poster="/placeholder.svg?height=200&width=300"
                    >
                      <source src={job.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {videoJobs.length === 0 && (
        <div className="flex h-64 items-center justify-center rounded-md border border-dashed">
          <div className="flex flex-col items-center gap-2 text-center">
            <Video className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No video generation jobs yet
            </p>
            <p className="text-xs text-muted-foreground">
              Start by entering a prompt above
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
