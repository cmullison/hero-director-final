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
  Settings2Icon,
  ChevronDownIcon,
  Loader2,
  History,
  Save,
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
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useImageGenerationStore, useUIStore, useProjectStore } from "@/stores";
import { cn } from "@/lib/utils";

export default function GPTImageGeneratorV2() {
  const {
    currentPrompt,
    currentSettings,
    preferences,
    generateImages,
    setPrompt,
    updateSettings,
  } = useImageGeneration();

  const {
    generationHistory,
    activeGenerations,
    recentPrompts,
    updatePreferences,
    markImageSaved,
    removeFromHistory,
  } = useImageGenerationStore();

  const { historyPanelOpen, toggleHistoryPanel, gridColumns } = useUIStore();
  const { activeProjectId, projectName } = useProjectStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [displayedImages, setDisplayedImages] = useState<string[]>([]);

  // Check if any generation is active
  const hasActiveGeneration = activeGenerations.size > 0;

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;
    if (isGenerating && startTime) {
      timerInterval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else if (!isGenerating) {
      setElapsedTime(0);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
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

  const sizeOptions = {
    square: "1024x1024",
    portrait: "1024x1792",
    landscape: "1792x1024",
  };

  const handleGenerate = async () => {
    if (!currentPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setStartTime(Date.now());
    setDisplayedImages([]);

    const result = await generateImages({
      prompt: currentPrompt,
      settings: currentSettings,
    });

    if (result.success && result.images) {
      setDisplayedImages(result.images.map((img) => img.url));
    }

    setIsGenerating(false);
    setStartTime(null);
  };

  const handleSaveImage = async (imageUrl: string) => {
    try {
      const response = await fetch("/api/save-generated-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrls: [imageUrl],
          prompt: currentPrompt,
          projectId: activeProjectId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        const imageId = generationHistory.find((img) => img.url === imageUrl)?.id;
        if (imageId) {
          markImageSaved(imageId);
        }
        toast.success("Image saved successfully!");
      } else {
        throw new Error(result.error || "Failed to save image");
      }
    } catch (error) {
      toast.error("Failed to save image");
    }
  };

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className={cn("flex-1 p-6", historyPanelOpen && "pr-0")}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">GPT Image Generator</h1>
            <div className="flex items-center gap-2">
              {activeProjectId && (
                <div className="text-sm text-muted-foreground">
                  Project: {projectName}
                </div>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleHistoryPanel}
              >
                <History className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Prompt input */}
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="Describe what you want to generate..."
                value={currentPrompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] pr-12"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleGenerate();
                  }
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2"
                onClick={() => setPrompt("")}
              >
                <RotateCcwIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Recent prompts dropdown */}
            {recentPrompts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Recent Prompts <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[400px]">
                  {recentPrompts.map((prompt, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => setPrompt(prompt)}
                      className="truncate"
                    >
                      {prompt}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Settings */}
            <div className="flex items-center gap-4">
              <Select
                value={currentSettings.size}
                onValueChange={(value) => updateSettings({ size: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sizeOptions).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={currentSettings.quality}
                onValueChange={(value: "standard" | "hd") =>
                  updateSettings({ quality: value })
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="hd">HD</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Label>Images:</Label>
                <Slider
                  value={[currentSettings.n || 1]}
                  onValueChange={([value]) => updateSettings({ n: value })}
                  min={1}
                  max={4}
                  step={1}
                  className="w-[100px]"
                />
                <span className="text-sm font-medium w-8">
                  {currentSettings.n || 1}
                </span>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings2Icon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Preferences</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autosave"
                        checked={preferences.autoSave}
                        onCheckedChange={(checked) =>
                          updatePreferences({ autoSave: checked as boolean })
                        }
                      />
                      <Label htmlFor="autosave">Auto-save generated images</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>History limit</Label>
                      <Slider
                        value={[preferences.historyLimit]}
                        onValueChange={([value]) =>
                          updatePreferences({ historyLimit: value })
                        }
                        min={10}
                        max={100}
                        step={10}
                      />
                      <span className="text-sm text-muted-foreground">
                        Keep last {preferences.historyLimit} images
                      </span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !currentPrompt.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating... ({elapsedTime}s)
                </>
              ) : (
                <>
                  <Wand2Icon className="mr-2 h-4 w-4" />
                  Generate Images
                </>
              )}
            </Button>
          </div>

          {/* Ideas */}
          <div className="flex flex-wrap gap-2">
            {ideas.map((idea) => (
              <Button
                key={idea}
                variant="outline"
                size="sm"
                onClick={() => setPrompt(idea)}
              >
                {idea}
              </Button>
            ))}
          </div>

          {/* Generated images */}
          {displayedImages.length > 0 && (
            <div
              className={cn(
                "grid gap-4",
                gridColumns === 2 && "grid-cols-2",
                gridColumns === 3 && "grid-cols-3",
                gridColumns === 4 && "grid-cols-4"
              )}
            >
              {displayedImages.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Generated ${index + 1}`}
                    className="w-full rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSaveImage(url)}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* History panel */}
      {historyPanelOpen && (
        <div className="w-80 border-l bg-muted/10 p-4 overflow-y-auto">
          <h3 className="font-medium mb-4">Generation History</h3>
          {generationHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No images yet</p>
          ) : (
            <div className="space-y-4">
              {generationHistory.map((image) => (
                <div key={image.id} className="space-y-2">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full rounded-lg"
                  />
                  <p className="text-xs text-muted-foreground truncate">
                    {image.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(image.timestamp).toLocaleString()}
                    </span>
                    {image.saved && (
                      <span className="text-xs text-green-600">Saved</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setPrompt(image.prompt);
                      updateSettings(image.settings);
                    }}
                  >
                    Use this prompt
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}