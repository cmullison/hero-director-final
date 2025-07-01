import React, { useState, useCallback, useRef } from "react";
import ProviderAnalytics from "../models/model-analytics";
import { ImageGenerator } from "../sandbox/image-generator";
import { ImageEditor } from "../sandbox/image-editor";
import Tabs from "@/components/ui/tabs";

const fluxPageTabs = ["Image Generation", "Image Editing"];

export default function ImageGeneration() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [isProcessingEdit, setIsProcessingEdit] = useState(false);
  const processedImagesRef = useRef(new Set<string>());

  const handleTabChange = useCallback((index: number) => {
    setActiveTabIndex(index);
  }, []);

  const handleEditImage = useCallback(
    async (imageUrl: string) => {
      // Prevent processing the same image multiple times
      if (processedImagesRef.current.has(imageUrl) || isProcessingEdit) {
        return;
      }

      try {
        setIsProcessingEdit(true);
        processedImagesRef.current.add(imageUrl);

        // Check if it's already a data URL
        if (imageUrl.startsWith("data:")) {
          setImageToEdit(imageUrl);
          setActiveTabIndex(1);
          return;
        }

        // Convert the image URL to a base64 data URL
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();

        // Convert blob to base64 data URL
        const reader = new FileReader();
        reader.onload = () => {
          const base64DataUrl = reader.result as string;
          setImageToEdit(base64DataUrl);
          setActiveTabIndex(1);
        };
        reader.onerror = () => {
          throw new Error("Failed to convert image to base64");
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error converting image for editing:", error);
        // Still switch to editing tab but show error
        alert("Error loading image for editing. Please try again.");
        setActiveTabIndex(1);
      } finally {
        setIsProcessingEdit(false);
      }
    },
    [isProcessingEdit]
  );

  const handleClearInitialImage = useCallback(() => {
    setImageToEdit(null);
  }, []);

  return (
    <div className="text-foreground">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Flux AI Image Tools</h1>
          <p className="text-muted-foreground">
            Generate and edit images using Black Forest Labs' Flux models
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={fluxPageTabs}
          onTabChange={handleTabChange}
          initialActiveIndex={activeTabIndex}
        />

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTabIndex === 0 && (
            <div>
              <ImageGenerator onEditImage={handleEditImage} />
            </div>
          )}
          {activeTabIndex === 1 && (
            <div>
              <ImageEditor
                initialImageToEdit={imageToEdit}
                onEditImage={handleEditImage}
                onClearInitialImage={handleClearInitialImage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
