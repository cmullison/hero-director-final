"use client";
import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Loader2, Edit } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
// Import only the server-side action we still need
import { generateImageAction } from "@/api/generate-image";

// Interface for form data
interface FormData {
  prompt: string;
  seed: number;
  go_fast: boolean;
  megapixels: string;
  num_outputs: number;
  aspect_ratio: string;
  output_format: string;
  output_quality: number;
  num_inference_steps: number;
  disable_safety_checker: boolean;
}

// Interface for component props
interface ImageGeneratorProps {
  onEditImage: (imageUrl: string) => void;
}

// Constants
const ASPECT_RATIOS = [
  { label: "Square (1:1)", value: "1:1" },
  { label: "Landscape (3:2)", value: "3:2" },
  { label: "Portrait (2:3)", value: "2:3" },
  { label: "Widescreen (16:9)", value: "16:9" },
  { label: "Mobile (9:16)", value: "9:16" },
] as const;

const MEGAPIXEL_OPTIONS = [
  { label: "0.25 MP (SD)", value: "0.25" },
  { label: "0.5 MP (HD)", value: "0.5" },
  { label: "1 MP (HD+)", value: "1" },
  { label: "2 MP (2K)", value: "2" },
] as const;

const defaultFormData: FormData = {
  prompt: "",
  seed: 0,
  go_fast: false,
  megapixels: "1",
  num_outputs: 4,
  aspect_ratio: "1:1",
  output_format: "webp",
  output_quality: 80,
  num_inference_steps: 4,
  disable_safety_checker: true,
};

// Type for individual save status
interface SaveStatus {
  url: string;
  status: "pending" | "success" | "error";
  message?: string; // Path on success, error message on failure
}

export function ImageGenerator({ onEditImage }: ImageGeneratorProps) {
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [generatedImageUrls, setGeneratedImageUrls] = useState<string[]>([]);
  const [saveStatuses, setSaveStatuses] = useState<SaveStatus[]>([]);

  const [generateIsPending, startGenerateTransition] = useTransition();
  const [saveIsPending, startSaveTransition] = useTransition();

  // Trigger save for all generated images
  const triggerSaveAll = (urls: string[], prompt: string) => {
    setSaveStatuses(urls.map((url) => ({ url, status: "pending" })));

    startSaveTransition(async () => {
      const savePromises = urls.map(async (url, idx) => {
        console.log(`Attempting to save image #${idx + 1}:`, url);

        // Use the server API endpoint instead of calling the function directly
        const response = await fetch("/api/save-generated-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrls: [url], // Send each URL individually to prevent batch failures
            prompt,
          }),
        });

        const result = (await response.json()) as {
          success: boolean;
          results: {
            success: boolean;
            imageUrl: string;
            path?: string;
            error?: string;
          }[];
          error?: string;
        };

        setSaveStatuses((prev) =>
          prev.map((s) =>
            s.url === url
              ? {
                  ...s,
                  status: result.success ? "success" : "error",
                  message:
                    result.success && result.results[0]?.path
                      ? `Saved: ${result.results[0].path}`
                      : result.error ||
                        result.results[0]?.error ||
                        "Failed to save image.",
                }
              : s
          )
        );
        if (result.success && result.results[0]?.path) {
          console.log(
            `Save successful for image #${idx + 1}:`,
            result.results[0].path
          );
        } else {
          console.error(
            `Save failed for image #${idx + 1}:`,
            result.error || result.results[0]?.error
          );
        }
      });
      await Promise.allSettled(savePromises); // Wait for all saves to complete or fail
      console.log("All save operations finished.");
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setGeneratedImageUrls([]);
    setSaveStatuses([]);

    console.log("Submitting generation request with data:", formData);

    startGenerateTransition(async () => {
      // Send the request to the server API endpoint instead of calling the function directly
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = (await response.json()) as {
        success: boolean;
        imageUrls?: string[];
        error?: string;
      };

      if (result.success && result.imageUrls && result.imageUrls.length > 0) {
        console.log("Generation successful, image URLs:", result.imageUrls);
        setGeneratedImageUrls(result.imageUrls);
        setError(null);
        // Trigger auto-save for all generated images
        triggerSaveAll(result.imageUrls, formData.prompt);
      } else {
        console.error("Generation failed:", result.error);
        setError(
          result.error || "An unknown error occurred during generation."
        );
        setGeneratedImageUrls([]);
      }
    });
  };

  // Determine if any save is pending
  const isAnySavePending = saveStatuses.some((s) => s.status === "pending");

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Image Generation</h1>
            <p className="text-muted-foreground">
              Create images with AI models
            </p>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none">
              Save Images
            </Button>
            <Button variant="default" className="flex-1 sm:flex-none">
              New Generation
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main image generator area - takes up 2/3 of the space on desktop, full width on mobile */}
          <div className="md:col-span-2 order-2 md:order-1">
            <Card>
              <CardHeader>
                <CardTitle>Image Generator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Generate images from text prompts
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Textarea
                      id="prompt"
                      value={formData.prompt}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          prompt: e.target.value,
                        }))
                      }
                      placeholder="Describe the image you want to generate..."
                      className="min-h-[100px] p-3"
                      disabled={generateIsPending || saveIsPending}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, prompt: "" }))
                      }
                      disabled={generateIsPending || saveIsPending}
                      className="px-4"
                    >
                      Clear
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        generateIsPending ||
                        saveIsPending ||
                        !formData.prompt.trim()
                      }
                      className="px-6"
                    >
                      {generateIsPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generate
                        </>
                      ) : (
                        <>Generate</>
                      )}
                    </Button>
                  </div>

                  {/* Display Error Messages */}
                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertDescription>
                        Generation Error: {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Display Generated Images */}
                  {(generateIsPending || generatedImageUrls.length > 0) && (
                    <div className="mt-6 space-y-4">
                      {/* Generation Spinner */}
                      {generateIsPending && (
                        <div className="flex flex-col items-center space-y-2">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Generating image(s)...
                          </p>
                        </div>
                      )}

                      {/* Image Grid */}
                      {generatedImageUrls.length > 0 && !generateIsPending && (
                        <div
                          className={`grid grid-cols-1 ${formData.num_outputs > 1 ? "sm:grid-cols-2" : ""} gap-4 ${
                            formData.num_outputs === 1 ? "max-w-md mx-auto" : ""
                          }`}
                        >
                          {generatedImageUrls.map((originalImageUrl, index) => {
                            const saveStatus = saveStatuses.find(
                              (s) => s.url === originalImageUrl
                            );
                            let imageUrlToDisplay = originalImageUrl;

                            if (
                              saveStatus?.status === "success" &&
                              saveStatus.message?.startsWith("Saved: ")
                            ) {
                              const r2Path = saveStatus.message.substring(
                                "Saved: ".length
                              );
                              imageUrlToDisplay = `/images/${r2Path}`;
                            }

                            return (
                              <div
                                key={originalImageUrl}
                                className="relative aspect-square w-full overflow-hidden rounded-lg border group"
                              >
                                {/* Edit image button */}
                                <Button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (
                                      imageUrlToDisplay &&
                                      typeof onEditImage === "function"
                                    ) {
                                      onEditImage(imageUrlToDisplay);
                                    }
                                  }}
                                  className="absolute top-2 left-2 z-10 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                  size="sm"
                                  type="button"
                                >
                                  <Edit className="h-3 w-3" />
                                  Edit
                                </Button>
                                <a
                                  href={`https://blob.mulls.io${imageUrlToDisplay.replace("/images/", "/generated-uploads_")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block absolute top-10 right-2 z-10 bg-black/50 text-white text-xs px-1 py-0.5 rounded"
                                >
                                  View direct
                                </a>
                                <a
                                  href={`https://blob.mulls.io${imageUrlToDisplay.replace("/images/", "/generated-uploads_")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-full h-full"
                                >
                                  <img
                                    src={imageUrlToDisplay}
                                    alt={`Generated image ${index + 1} for prompt: ${
                                      formData.prompt
                                    }`}
                                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                    loading={index < 2 ? "eager" : "lazy"}
                                    style={{
                                      display: "block",
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      console.error(
                                        `Error loading image ${
                                          index + 1
                                        } from URL: ${imageUrlToDisplay}`
                                      );
                                      e.currentTarget.style.display = "none";
                                      const errorPlaceholder = e.currentTarget
                                        .nextElementSibling as HTMLElement;
                                      if (errorPlaceholder) {
                                        errorPlaceholder.classList.remove(
                                          "hidden"
                                        );
                                      }
                                    }}
                                  />
                                </a>
                                {/* Error placeholder div */}
                                <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-700">
                                  <div className="text-center p-4">
                                    <ExternalLink className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-sm">
                                      Image preview unavailable
                                    </p>
                                    <p className="text-xs mt-1">
                                      Failed to load. Click "View direct" to try
                                      opening.
                                    </p>
                                  </div>
                                </div>
                                {/* Status indicator (non-blocking) */}
                                <div className="absolute bottom-2 left-2 z-10">
                                  {saveStatus?.status === "pending" && (
                                    <p className="text-xs text-white bg-black/70 px-2 py-1 rounded flex items-center">
                                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />{" "}
                                      Saving...
                                    </p>
                                  )}
                                  {saveStatus?.status === "success" && (
                                    <p className="text-xs text-green-300 bg-black/70 px-2 py-1 rounded">
                                      {saveStatus.message || "Saved"}
                                    </p>
                                  )}
                                  {saveStatus?.status === "error" && (
                                    <p className="text-xs text-red-300 bg-black/70 px-2 py-1 rounded">
                                      Save Failed:{" "}
                                      {saveStatus.message || "Unknown Error"}
                                    </p>
                                  )}
                                </div>
                                {/* Optional: Add a button to open image in new tab */}
                                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                                <button
                                  onClick={() =>
                                    window.open(
                                      `https://blob.mulls.io${imageUrlToDisplay.replace("/images/", "/generated-uploads_")}`,
                                      "_blank"
                                    )
                                  }
                                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/75"
                                  aria-label="Open image in new tab"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Overall Save Status Summary (optional) */}
                      {saveStatuses.length > 0 && !isAnySavePending && (
                        <div className="text-center text-sm mt-2">
                          {saveStatuses.every((s) => s.status === "success") ? (
                            <p className="text-green-600 dark:text-green-400">
                              All images saved successfully.
                            </p>
                          ) : saveStatuses.some((s) => s.status === "error") ? (
                            <p className="text-red-600 dark:text-red-400">
                              Some images failed to save. Check individual
                              images for details.
                            </p>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Configuration options sidebar - takes up 1/3 of the space on desktop, appears on top on mobile */}
          <div className="md:col-span-1 order-1 md:order-2">
            <Card>
              <CardHeader className="sm:pb-3">
                <CardTitle>Model Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure your image generation
                </p>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-3">
                {/* Model Selection */}
                <div className="space-y-2 sm:space-y-1">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value="flux-schnell"
                    onValueChange={() => {}}
                    disabled={generateIsPending || saveIsPending}
                  >
                    <SelectTrigger id="model" className="h-10">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flux-schnell">Flux Schnell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Megapixels and aspect ratio */}
                <div className="space-y-2 sm:space-y-1">
                  <Label>Image Size</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={formData.megapixels}
                      onValueChange={(value: string) =>
                        setFormData((prev) => ({ ...prev, megapixels: value }))
                      }
                      disabled={generateIsPending || saveIsPending}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Megapixels" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEGAPIXEL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={formData.aspect_ratio}
                      onValueChange={(value: string) =>
                        setFormData((prev) => ({
                          ...prev,
                          aspect_ratio: value,
                        }))
                      }
                      disabled={generateIsPending || saveIsPending}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Aspect Ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        {ASPECT_RATIOS.map((ratio) => (
                          <SelectItem key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Output Format */}
                <div className="space-y-2 sm:space-y-1">
                  <Label>Output Format</Label>
                  <Select
                    value={formData.output_format}
                    onValueChange={(value: string) =>
                      setFormData((prev) => ({ ...prev, output_format: value }))
                    }
                    disabled={generateIsPending || saveIsPending}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webp">WebP (modern)</SelectItem>
                      <SelectItem value="jpg">JPEG (smaller size)</SelectItem>
                      <SelectItem value="png">PNG (lossless)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality Slider */}
                <div className="space-y-2 sm:space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="output_quality">Output Quality</Label>
                    <span className="text-sm text-muted-foreground">
                      {formData.output_quality}%
                    </span>
                  </div>
                  <Slider
                    id="output_quality"
                    value={[formData.output_quality]}
                    onValueChange={([value]) =>
                      setFormData((prev) => ({
                        ...prev,
                        output_quality: value,
                      }))
                    }
                    min={0}
                    max={100}
                    step={1}
                    className="mt-2"
                    disabled={generateIsPending || saveIsPending}
                  />
                </div>

                {/* Number of Outputs */}
                <div className="space-y-2 sm:space-y-1">
                  <Label>Number of Images</Label>
                  <div className="flex items-center">
                    <Input
                      type="number"
                      min="1"
                      max="4"
                      value={formData.num_outputs}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          num_outputs: parseInt(e.target.value) || 1,
                        }))
                      }
                      className="w-full sm:w-20 h-10 text-center"
                      disabled={generateIsPending || saveIsPending}
                    />
                    <div className="hidden sm:flex flex-1 ml-2">
                      <div className="flex items-center justify-between w-full">
                        <button
                          type="button"
                          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              num_outputs: Math.max(1, prev.num_outputs - 1),
                            }))
                          }
                          disabled={
                            formData.num_outputs <= 1 ||
                            generateIsPending ||
                            saveIsPending
                          }
                        >
                          -
                        </button>
                        <button
                          type="button"
                          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              num_outputs: Math.min(4, prev.num_outputs + 1),
                            }))
                          }
                          disabled={
                            formData.num_outputs >= 4 ||
                            generateIsPending ||
                            saveIsPending
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seed */}
                <div className="space-y-2 sm:space-y-1">
                  <Label htmlFor="seed">Seed (0 for random)</Label>
                  <Input
                    id="seed"
                    type="number"
                    value={formData.seed}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        seed: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="Enter seed (0 for random)"
                    className="h-10"
                    disabled={generateIsPending || saveIsPending}
                  />
                </div>

                {/* Steps Slider */}
                <div className="space-y-2 sm:space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="inference_steps">Generation Steps</Label>
                    <span className="text-sm text-muted-foreground">
                      {formData.num_inference_steps} steps
                    </span>
                  </div>
                  <Slider
                    id="inference_steps"
                    value={[formData.num_inference_steps]}
                    onValueChange={([value]) =>
                      setFormData((prev) => ({
                        ...prev,
                        num_inference_steps: value,
                      }))
                    }
                    min={1}
                    max={4}
                    step={1}
                    className="mt-2"
                    disabled={generateIsPending || saveIsPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Fewer steps are faster but may reduce quality
                  </p>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <Label htmlFor="go_fast" className="text-sm">
                        Prioritize Speed
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Toggle between faster generation and higher quality
                      </p>
                    </div>
                    <Switch
                      id="go_fast"
                      checked={formData.go_fast}
                      onCheckedChange={(checked: boolean) =>
                        setFormData((prev) => ({ ...prev, go_fast: checked }))
                      }
                      disabled={generateIsPending || saveIsPending}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <Label htmlFor="safety_checker" className="text-sm">
                        Safety Filter
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Disable to allow potentially sensitive content
                      </p>
                    </div>
                    <Switch
                      id="safety_checker"
                      checked={!formData.disable_safety_checker}
                      onCheckedChange={(checked: boolean) =>
                        setFormData((prev) => ({
                          ...prev,
                          disable_safety_checker: !checked,
                        }))
                      }
                      disabled={generateIsPending || saveIsPending}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
