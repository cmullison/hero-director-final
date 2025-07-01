"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Loader2,
  Play,
  Video,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Image,
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

interface KlingVideoGeneratorProps {
  onStartImageChange?: (image: string | null) => void;
}

export function KlingVideoGenerator({
  onStartImageChange,
}: KlingVideoGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [duration, setDuration] = useState<5 | 10>(5);
  const [cfgScale, setCfgScale] = useState(0.5);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">(
    "16:9"
  );
  const [startImage, setStartImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoJobs, setVideoJobs] = useState<VideoJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

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
      const response = await fetch("/api/kling-video-jobs", {
        credentials: "include",
      });

      if (response.ok) {
        const data = (await response.json()) as {
          success: boolean;
          jobs?: VideoJob[];
        };
        setVideoJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Failed to load Kling video jobs:", error);
    }
  };

  const updateJobStatuses = async () => {
    const processingJobs = videoJobs.filter(
      (job) => job.status === "pending" || job.status === "processing"
    );

    for (const job of processingJobs) {
      try {
        const response = await fetch(`/api/kling-video-jobs/${job.id}`, {
          credentials: "include",
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setStartImage(base64);
        onStartImageChange?.(base64);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image");
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-kling-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          prompt: prompt.trim(),
          negative_prompt: negativePrompt.trim(),
          duration,
          cfg_scale: cfgScale,
          aspect_ratio: aspectRatio,
          ...(startImage && { start_image: startImage }),
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
          setNegativePrompt("");
          setStartImage(null);
          onStartImageChange?.(null);
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
      const response = await fetch(`/api/kling-video-jobs/${jobId}/cancel`, {
        method: "POST",
        credentials: "include",
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
      <div className="space-y-4">
        {/* Main Prompt */}
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Describe the video you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Negative Prompt */}
        <div className="space-y-2">
          <Label htmlFor="negative-prompt">
            Negative Prompt
            <span className="text-xs text-muted-foreground ml-2">
              Things you don't want to see
            </span>
          </Label>
          <Textarea
            id="negative-prompt"
            placeholder="Things to avoid in the video..."
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="min-h-[60px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select
              value={duration.toString()}
              onValueChange={(value) => setDuration(Number(value) as 5 | 10)}
            >
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 seconds</SelectItem>
                <SelectItem value="10">10 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <Label htmlFor="aspect-ratio">
              Aspect Ratio
              {startImage && (
                <span className="text-xs text-muted-foreground ml-2">
                  (Ignored when using start image)
                </span>
              )}
            </Label>
            <Select
              value={aspectRatio}
              onValueChange={(value) =>
                setAspectRatio(value as typeof aspectRatio)
              }
              disabled={!!startImage}
            >
              <SelectTrigger id="aspect-ratio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* CFG Scale */}
        <div className="space-y-2">
          <Label htmlFor="cfg-scale">
            CFG Scale: {cfgScale.toFixed(2)}
            <span className="text-xs text-muted-foreground ml-2">
              Higher = Stronger adherence to prompt
            </span>
          </Label>
          <Slider
            id="cfg-scale"
            min={0}
            max={1}
            step={0.05}
            value={[cfgScale]}
            onValueChange={(value) => setCfgScale(value[0])}
            className="w-full"
          />
        </div>

        {/* Start Image */}
        <div className="space-y-2">
          <Label htmlFor="start-image">
            Start Image
            <span className="text-xs text-muted-foreground ml-2">
              Optional first frame of the video
            </span>
          </Label>
          <div className="flex items-center gap-4">
            <Input
              id="start-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isLoadingImage}
            />
            <Label
              htmlFor="start-image"
              className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent"
            >
              <Upload className="h-4 w-4" />
              {isLoadingImage ? "Uploading..." : "Upload Image"}
            </Label>
            {startImage && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setStartImage(null);
                  onStartImageChange?.(null);
                }}
              >
                Remove Image
              </Button>
            )}
          </div>
          {startImage && (
            <div className="mt-2">
              <img
                src={startImage}
                alt="Start frame"
                className="h-32 w-auto rounded-md object-cover"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setPrompt("");
              setNegativePrompt("");
              setStartImage(null);
              onStartImageChange?.(null);
            }}
            disabled={
              (!prompt && !negativePrompt && !startImage) || isGenerating
            }
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

      {/* Video Jobs */}
      {videoJobs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Video Generation Jobs</h3>
          <div className="space-y-3">
            {videoJobs.map((job) => {
              const settings = job.settings ? JSON.parse(job.settings) : null;
              return (
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
                      {settings && (
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {settings.duration}s
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {settings.aspect_ratio}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            CFG: {settings.cfg_scale}
                          </Badge>
                        </div>
                      )}
                      {job.error_message && (
                        <p className="text-sm text-red-600 mt-2">
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
                              a.download = `kling-video-${job.id}.mp4`;
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
              );
            })}
          </div>
        </div>
      )}

      {videoJobs.length === 0 && (
        <div className="flex h-64 items-center justify-center rounded-md border border-dashed">
          <div className="flex flex-col items-center gap-2 text-center">
            <Video className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No Kling video generation jobs yet
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
