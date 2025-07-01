"use client";
import { useState, useTransition, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Loader2, Upload, Edit } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Interface for form data specific to flux-kontext-pro
interface EditFormData {
  prompt: string;
  input_image: string;
  seed: number;
  aspect_ratio: string;
  output_format: string;
  safety_tolerance: number;
}

// Interface for component props
interface ImageEditorProps {
  initialImageToEdit?: string | null;
  onEditImage: (imageUrl: string) => void;
  onClearInitialImage: () => void;
}

// Constants for aspect ratios
const ASPECT_RATIOS = [
  { label: "Match Input Image", value: "match_input_image" },
  { label: "Square (1:1)", value: "1:1" },
  { label: "Landscape (3:2)", value: "3:2" },
  { label: "Portrait (2:3)", value: "2:3" },
  { label: "Widescreen (16:9)", value: "16:9" },
  { label: "Mobile (9:16)", value: "9:16" },
] as const;

const defaultFormData: EditFormData = {
  prompt: "",
  input_image: "",
  seed: 0,
  aspect_ratio: "match_input_image",
  output_format: "png",
  safety_tolerance: 2,
};

// Type for individual save status
interface SaveStatus {
  url: string;
  status: "pending" | "success" | "error";
  message?: string;
}

export function ImageEditor({
  initialImageToEdit,
  onEditImage,
  onClearInitialImage,
}: ImageEditorProps) {
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditFormData>(defaultFormData);
  const [generatedImageUrls, setGeneratedImageUrls] = useState<string[]>([]);
  const [saveStatuses, setSaveStatuses] = useState<SaveStatus[]>([]);
  const [inputImagePreview, setInputImagePreview] = useState<string | null>(
    null
  );
  const processedInitialImageRef = useRef<string | null>(null);

  const [generateIsPending, startGenerateTransition] = useTransition();
  const [saveIsPending, startSaveTransition] = useTransition();

  // Handle initial image from parent component using useEffect
  useEffect(() => {
    if (
      initialImageToEdit &&
      initialImageToEdit !== processedInitialImageRef.current
    ) {
      setFormData((prev) => ({ ...prev, input_image: initialImageToEdit }));
      setInputImagePreview(initialImageToEdit);
      processedInitialImageRef.current = initialImageToEdit;

      // Clear the initial image after a short delay to prevent re-renders
      setTimeout(() => {
        onClearInitialImage();
      }, 100);
    }
  }, [initialImageToEdit]); // Remove onClearInitialImage from deps to prevent re-renders

  // Handle file upload for input image
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData((prev) => ({ ...prev, input_image: result }));
      setInputImagePreview(result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Trigger save for all generated images
  const triggerSaveAll = (urls: string[], prompt: string) => {
    setSaveStatuses(urls.map((url) => ({ url, status: "pending" })));

    startSaveTransition(async () => {
      const savePromises = urls.map(async (url, idx) => {
        console.log(`Attempting to save image #${idx + 1}:`, url);

        const response = await fetch("/api/save-generated-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrls: [url],
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
      });
      await Promise.allSettled(savePromises);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setGeneratedImageUrls([]);
    setSaveStatuses([]);

    if (!formData.input_image) {
      setError("Please upload an input image");
      return;
    }

    console.log("Submitting editing request with data:", formData);

    startGenerateTransition(async () => {
      const response = await fetch("/api/edit-image", {
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
        console.log("Editing successful, image URLs:", result.imageUrls);
        setGeneratedImageUrls(result.imageUrls);
        setError(null);
        triggerSaveAll(result.imageUrls, formData.prompt);
      } else {
        console.error("Editing failed:", result.error);
        setError(result.error || "An unknown error occurred during editing.");
        setGeneratedImageUrls([]);
      }
    });
  };

  const isAnySavePending = saveStatuses.some((s) => s.status === "pending");

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Image Editing</h1>
            <p className="text-muted-foreground">
              Edit images with AI using Flux Kontext Pro
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main image editor area */}
          <div className="md:col-span-2 order-2 md:order-1">
            <Card>
              <CardHeader>
                <CardTitle>Image Editor</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload an image and describe how you want to edit it
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Input Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="input_image">Input Image</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      {inputImagePreview ? (
                        <div className="relative">
                          <img
                            src={inputImagePreview}
                            alt="Input image preview"
                            className="max-w-full h-auto rounded-lg mx-auto max-h-64 object-contain"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setInputImagePreview(null);
                              setFormData((prev) => ({
                                ...prev,
                                input_image: "",
                              }));
                            }}
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                          <div className="mt-4">
                            <label
                              htmlFor="file-upload"
                              className="cursor-pointer"
                            >
                              <span className="mt-2 block text-sm font-medium text-muted-foreground">
                                Upload an image to edit
                              </span>
                              <p className="text-xs text-muted-foreground mt-1">
                                Supports JPEG, PNG, GIF, WebP (max 10MB)
                              </p>
                            </label>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              onChange={handleFileUpload}
                              disabled={generateIsPending || saveIsPending}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prompt */}
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Editing Instructions</Label>
                    <Textarea
                      id="prompt"
                      value={formData.prompt}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          prompt: e.target.value,
                        }))
                      }
                      placeholder="Describe how you want to edit the image..."
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
                        !formData.prompt.trim() ||
                        !formData.input_image
                      }
                      className="px-6"
                    >
                      {generateIsPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Edit Image
                        </>
                      ) : (
                        <>Edit Image</>
                      )}
                    </Button>
                  </div>

                  {/* Display Error Messages */}
                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertDescription>Edit Error: {error}</AlertDescription>
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
                            Editing image...
                          </p>
                        </div>
                      )}

                      {/* Image Grid */}
                      {generatedImageUrls.length > 0 && !generateIsPending && (
                        <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
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
                                  onClick={() => onEditImage(imageUrlToDisplay)}
                                  className="absolute top-2 left-2 z-10 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                  size="sm"
                                >
                                  <Edit className="h-3 w-3" />
                                  Edit
                                </Button>
                                <a
                                  href={
                                    originalImageUrl.startsWith("http")
                                      ? originalImageUrl
                                      : `https://blob.mulls.io/generated-uploads/${imageUrlToDisplay.replace("/images/", "")}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block absolute top-10 right-2 z-10 bg-black/50 text-white text-xs px-1 py-0.5 rounded"
                                >
                                  View direct
                                </a>
                                <a
                                  href={
                                    originalImageUrl.startsWith("http")
                                      ? originalImageUrl
                                      : `https://blob.mulls.io/generated-uploads/${imageUrlToDisplay.replace("/images/", "")}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-full h-full"
                                >
                                  <img
                                    src={imageUrlToDisplay}
                                    alt={`Edited image ${index + 1} for prompt: ${
                                      formData.prompt
                                    }`}
                                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                    loading="eager"
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
                                {/* Status indicator */}
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
                                {/* External link button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    window.open(
                                      originalImageUrl.startsWith("http")
                                        ? originalImageUrl
                                        : `https://blob.mulls.io/generated-uploads/${imageUrlToDisplay.replace("/images/", "")}`,
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

                      {/* Save Status Summary */}
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

          {/* Configuration options sidebar */}
          <div className="md:col-span-1 order-1 md:order-2">
            <Card>
              <CardHeader className="sm:pb-3">
                <CardTitle>Model Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure your image editing
                </p>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-3">
                {/* Model Selection */}
                <div className="space-y-2 sm:space-y-1">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value="flux-kontext-pro"
                    onValueChange={() => {}}
                    disabled={generateIsPending || saveIsPending}
                  >
                    <SelectTrigger id="model" className="h-10">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flux-kontext-pro">
                        Flux Kontext Pro
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2 sm:space-y-1">
                  <Label>Aspect Ratio</Label>
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
                      <SelectItem value="png">PNG (lossless)</SelectItem>
                      <SelectItem value="webp">WebP (modern)</SelectItem>
                      <SelectItem value="jpg">JPEG (smaller size)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Safety Tolerance */}
                <div className="space-y-2 sm:space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="safety_tolerance">Safety Tolerance</Label>
                    <span className="text-sm text-muted-foreground">
                      {formData.safety_tolerance}
                    </span>
                  </div>
                  <Slider
                    id="safety_tolerance"
                    value={[formData.safety_tolerance]}
                    onValueChange={([value]) =>
                      setFormData((prev) => ({
                        ...prev,
                        safety_tolerance: value,
                      }))
                    }
                    min={0}
                    max={2}
                    step={1}
                    className="mt-2"
                    disabled={generateIsPending || saveIsPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    0 is most strict, 2 is most permissive (max for input
                    images)
                  </p>
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
                  <p className="text-xs text-muted-foreground">
                    Use the same seed for reproducible results
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
