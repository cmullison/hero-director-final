import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ImageIcon,
  Wand2Icon,
  RotateCcwIcon,
  ClipboardIcon,
  CogIcon,
  SettingsIcon,
  SlidersIcon,
  ChevronDownIcon,
  CheckIcon,
  AlertCircleIcon,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function GPTImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageCount, setImageCount] = useState(1);
  const [selectedSize, setSelectedSize] = useState("square");
  const [selectedQuality, setSelectedQuality] = useState("high");
  const [selectedIdea, setSelectedIdea] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [outputCompression, setOutputCompression] = useState(80);
  // Advanced settings
  const [outputFormat, setOutputFormat] = useState("webp");
  const [background, setBackground] = useState("auto");
  const [moderation, setModeration] = useState("low");
  const [advancedDialogOpen, setAdvancedDialogOpen] = useState(false);

  // Loading state and timer
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;
    if (isGenerating && startTime) {
      timerInterval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else if (!isGenerating && timerInterval) {
      clearInterval(timerInterval);
    }
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isGenerating, startTime]);

  const ideas = [
    "Logo",
    "Business Card",
    "Furniture Design",
    "Handbag matching outfit",
    "Speaker Ad",
    "Sneakers design",
    "3D City",
    "Glass Speaker",
    "Chocolate Bar",
  ];

  // Map size values to OpenAI size formats
  const sizeToOpenAI = {
    square: "1024x1024",
    portrait: "1024x1536",
    landscape: "1536x1024",
  };

  // Map quality values to OpenAI quality options
  const qualityToOpenAI = {
    auto: "auto",
    high: "high",
    medium: "medium",
    low: "low",
  };

  // Define API response types
  interface GenerateImageResult {
    success: boolean;
    imageUrls?: string[];
    base64Images?: string[];
    error?: string;
  }

  interface SaveImageResult {
    success: boolean;
    results?: {
      success: boolean;
      originalIndex: number;
      base64Provided: boolean;
      error?: string;
      path?: string;
      contentType?: string;
      url?: string;
    }[];
    error?: string;
  }

  // Function for API-based image generation
  const generateImages = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setGeneratedImages([]); // Clear previous images
    setStartTime(Date.now());
    setElapsedTime(0);

    try {
      // Prepare API request parameters
      const params = {
        prompt: prompt,
        n: imageCount,
        size: sizeToOpenAI[selectedSize as keyof typeof sizeToOpenAI],
        quality:
          qualityToOpenAI[selectedQuality as keyof typeof qualityToOpenAI],
        output_compression: outputCompression,
        output_format: outputFormat,
      };

      // Make API call to our backend
      const response = await fetch("/api/generate-image-openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const result = (await response.json()) as GenerateImageResult;

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate images");
      }

      // Array to store either URLs or base64 images
      let images: string[] = [];

      // Handle both URL and base64 responses
      if (result.imageUrls && result.imageUrls.length > 0) {
        images = result.imageUrls;
      } else if (result.base64Images && result.base64Images.length > 0) {
        // Convert base64 strings to data URLs if they're not already
        images = result.base64Images.map((b64) =>
          b64.startsWith("data:") ? b64 : `data:image/webp;base64,${b64}`
        );
      } else {
        throw new Error("No images returned from server");
      }

      // Automatically save the images before displaying
      console.log(`Auto-saving ${images.length} generated images...`);
      const saveResponse = await fetch("/api/save-generated-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrls: images,
          prompt: prompt,
        }),
      });

      const saveResult = (await saveResponse.json()) as SaveImageResult;

      if (!saveResponse.ok || !saveResult.success) {
        console.warn(
          "Failed to auto-save images, showing original URLs:",
          saveResult.error
        );
        setGeneratedImages(images); // Fall back to original images
      } else {
        // Extract saved image URLs from the response if available
        const savedUrls = saveResult.results
          ?.filter((r) => r.success && r.url)
          .map((r) => r.url as string);

        if (savedUrls && savedUrls.length > 0) {
          console.log("Using saved image URLs:", savedUrls);
          setGeneratedImages(savedUrls);
        } else {
          console.log("No saved URLs returned, using original images");
          setGeneratedImages(images);
        }
      }

      // Successful generation notification
      toast.success(`Generated ${images.length} image(s) successfully!`);
    } catch (error) {
      console.error("Error generating images:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      setErrorMessage(errorMsg);
      toast.error(`Image generation failed: ${errorMsg}`);
    } finally {
      setIsGenerating(false);
      setStartTime(null); // Reset start time
    }
  };

  const clearPrompt = () => {
    setPrompt("");
  };

  const applySelectedIdea = (idea: string) => {
    setSelectedIdea(idea);
    setPrompt(idea);
  };

  // Map size values to their display names
  const sizeOptions = {
    square: "Square (1024×1024)",
    portrait: "Portrait (1024×1536)",
    landscape: "Landscape (1536×1024)",
  };

  // Map quality values to their display names
  const qualityOptions = {
    auto: "Auto",
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  // Output format options for advanced settings
  const outputFormatOptions = ["png", "jpeg", "webp"];

  // Background options for advanced settings
  const backgroundOptions = ["auto", "transparent", "opaque"];

  // Moderation options for advanced settings
  const moderationOptions = ["auto", "low"];

  const saveGeneratedImages = async () => {
    if (!generatedImages.length) return;

    try {
      setIsGenerating(true); // Show loading state during save

      // First check if the images are already saved URLs from R2
      // If they start with '/images/' they've already been saved
      const unsavedImages = generatedImages.filter(
        (url) => !url.startsWith("/images/")
      );

      if (unsavedImages.length === 0) {
        toast.info("All images have already been saved!");
        setIsGenerating(false);
        return;
      }

      console.log(
        `Saving ${unsavedImages.length} unsaved images with prompt: "${prompt}"`
      );

      const response = await fetch("/api/save-generated-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrls: unsavedImages,
          prompt: prompt,
        }),
      });

      const result = (await response.json()) as SaveImageResult;

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save images");
      }

      // If the save was successful and we have URLs in the response
      if (result.results && result.results.length > 0) {
        // Count successful saves
        const successCount = result.results.filter((r) => r.success).length;

        // Update the generated images with the permanent URLs from R2 storage if available
        const newSavedUrls = result.results
          .filter((r) => r.success && r.url)
          .map((r) => r.url as string);

        if (newSavedUrls.length > 0) {
          // Replace only the unsaved images in our current list
          const updatedImages = [...generatedImages];
          let replacedCount = 0;

          for (let i = 0; i < updatedImages.length; i++) {
            if (
              !updatedImages[i].startsWith("/images/") &&
              replacedCount < newSavedUrls.length
            ) {
              updatedImages[i] = newSavedUrls[replacedCount];
              replacedCount++;
            }
          }

          setGeneratedImages(updatedImages);
          toast.success(
            `${successCount} additional image(s) saved successfully!`
          );
        } else {
          toast.success(`${successCount} image(s) saved successfully!`);
        }
      } else {
        toast.success("Images saved successfully!");
      }
    } catch (error) {
      console.error("Error saving images:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to save images: ${errorMsg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <header className="w-full p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-semibold">Images</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGeneratedImages([])}
          >
            Clear
          </Button>
          {generatedImages.length > 0 &&
            generatedImages.some((url) => !url.startsWith("/images/")) && (
              <Button variant="outline" size="sm" onClick={saveGeneratedImages}>
                Save
              </Button>
            )}
          <Button variant="outline" size="sm">
            History
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full overflow-auto p-4">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-medium">Generating images...</p>
            {startTime && <p>Elapsed time: {elapsedTime}s</p>}
          </div>
        ) : generatedImages.length > 0 ? (
          <div
            className={[
              "grid gap-4",
              generatedImages.length === 1
                ? "grid-cols-1 max-w-lg mx-auto"
                : generatedImages.length <= 4
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
            ].join(" ")}
          >
            {generatedImages.map((img, index) => (
              <div
                key={index}
                className="aspect-square border border-gray-200 rounded-md overflow-hidden shadow-sm relative group"
              >
                <a
                  href={
                    img.startsWith("/images/")
                      ? `https://blob.mulls.io/generated-uploads/${img.replace("/images/", "")}`
                      : img
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <img
                    src={img}
                    alt={`Generated image ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </a>
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <a
                    href={
                      img.startsWith("/images/")
                        ? `https://blob.mulls.io/generated-uploads/${img.replace("/images/", "")}`
                        : img
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View larger
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty grid cells when no images and not loading (placeholder state)
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 w-full">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="aspect-square border border-gray-200">
                <div className="w-full h-full flex items-center justify-center">
                  {index === 1 && (
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                  {index !== 1 && (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Advanced Settings Dialog */}
      <Dialog open={advancedDialogOpen} onOpenChange={setAdvancedDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Advanced settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium">Output format</span>
              <div className="relative">
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger className="w-[100px] bg-gray-100">
                    <SelectValue>{outputFormat}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {outputFormatOptions.map((format) => (
                      <SelectItem key={format} value={format}>
                        <div className="flex items-center">
                          {outputFormat === format && (
                            <CheckIcon className="h-4 w-4 mr-2" />
                          )}
                          {format}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-base font-medium">Background</span>
              <div className="relative">
                <Select value={background} onValueChange={setBackground}>
                  <SelectTrigger className="w-[100px] bg-gray-100">
                    <SelectValue>{background}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        <div className="flex items-center">
                          {background === option && (
                            <CheckIcon className="h-4 w-4 mr-2" />
                          )}
                          {option}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-base font-medium">Moderation</span>
              <div className="relative">
                <Select value={moderation} onValueChange={setModeration}>
                  <SelectTrigger className="w-[100px] bg-gray-100">
                    <SelectValue>{moderation}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {moderationOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        <div className="flex items-center">
                          {moderation === option && (
                            <CheckIcon className="h-4 w-4 mr-2" />
                          )}
                          {option}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="w-full border-t mt-auto">
        <div className="p-4">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to see..."
              className="pr-12 pb-12 min-h-[100px] max-h-[200px] resize-y"
            />

            {errorMessage && (
              <div className="absolute top-0 left-0 right-0 p-1 px-2 bg-red-50 text-red-500 text-sm flex items-center z-10">
                <AlertCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{errorMessage}</span>
              </div>
            )}

            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Add image</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Idea suggestions dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <SlidersIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 p-0" side="top" align="start">
                  <div className="max-h-[200px] overflow-y-auto">
                    {ideas.map((idea) => (
                      <div
                        key={idea}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => applySelectedIdea(idea)}
                      >
                        {idea}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Settings popover for image configuration */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <CogIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px]" side="top" align="start">
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 font-medium">Size</h3>
                      <div className="space-y-2">
                        {Object.entries(sizeOptions).map(([value, label]) => (
                          <div
                            className="flex items-center space-x-2"
                            key={value}
                          >
                            <Checkbox
                              id={`size-${value}`}
                              checked={selectedSize === value}
                              onCheckedChange={() => setSelectedSize(value)}
                            />
                            <Label htmlFor={`size-${value}`}>{label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 font-medium">Quality</h3>
                      <div className="space-y-2">
                        {Object.entries(qualityOptions).map(
                          ([value, label]) => (
                            <div
                              className="flex items-center space-x-2"
                              key={value}
                            >
                              <Checkbox
                                id={`quality-${value}`}
                                checked={selectedQuality === value}
                                onCheckedChange={() =>
                                  setSelectedQuality(value)
                                }
                              />
                              <Label htmlFor={`quality-${value}`}>
                                {label}
                              </Label>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 font-medium">Output compression</h3>
                      <div className="flex items-center justify-between">
                        <span>{outputCompression}</span>
                      </div>
                      <Slider
                        defaultValue={[outputCompression]}
                        max={100}
                        min={1}
                        step={1}
                        onValueChange={(values) =>
                          setOutputCompression(values[0])
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <h3 className="mb-2 font-medium">Number of images</h3>
                      <div className="flex items-center justify-between">
                        <span>{imageCount}</span>
                      </div>
                      <Slider
                        defaultValue={[imageCount]}
                        max={10}
                        min={1}
                        step={1}
                        onValueChange={(values) => setImageCount(values[0])}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Button
                        className="w-full mt-2"
                        variant="outline"
                        onClick={() => setAdvancedDialogOpen(true)}
                      >
                        Advanced
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={clearPrompt}
                    >
                      <RotateCcwIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Reset</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="text-xs text-gray-500">
                {imageCount > 1 ? `${imageCount}×` : "1×"}
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => navigator.clipboard.writeText(prompt)}
                    >
                      <ClipboardIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Copy to clipboard</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="absolute bottom-3 right-3">
              <Button
                onClick={generateImages}
                disabled={!prompt.trim() || isGenerating}
                size="sm"
                className="rounded-full bg-emerald-500 hover:bg-emerald-600"
              >
                {isGenerating ? (
                  "Generating..."
                ) : (
                  <Wand2Icon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
