import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { useImageGenerationStore, useProjectStore } from '@/stores';
import { GeneratedImage, ImageGenerationSettings } from '@/stores/types';
import { toast } from 'sonner';

interface GenerateImagesParams {
  prompt: string;
  settings: ImageGenerationSettings;
}

interface ApiImageResponse {
  success: boolean;
  imageUrls?: string[];
  base64Images?: string[];
  error?: string;
}

interface SaveImageResponse {
  success: boolean;
  results?: {
    success: boolean;
    url?: string;
    path?: string;
  }[];
  error?: string;
}

export function useImageGeneration() {
  const {
    currentPrompt,
    currentSettings,
    preferences,
    startGeneration,
    updateGenerationStatus,
    completeGeneration,
    addToHistory,
    addRecentPrompt,
    setPrompt,
    updateSettings,
  } = useImageGenerationStore();

  const { activeProjectId } = useProjectStore();

  const generateImages = useCallback(
    async ({ prompt, settings }: GenerateImagesParams) => {
      const generationId = nanoid();
      
      // Start generation tracking
      startGeneration(generationId, prompt, settings);
      
      try {
        // Make API call
        const response = await fetch('/api/generate-image-openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            n: settings.n || 1,
            size: settings.size || '1024x1024',
            quality: settings.quality || 'standard',
            output_compression: 80,
            output_format: settings.outputFormat || 'webp',
          }),
        });

        const result: ApiImageResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to generate images');
        }

        // Process images
        let images: string[] = [];
        if (result.imageUrls && result.imageUrls.length > 0) {
          images = result.imageUrls;
        } else if (result.base64Images && result.base64Images.length > 0) {
          images = result.base64Images.map((b64) =>
            b64.startsWith('data:') ? b64 : `data:image/webp;base64,${b64}`
          );
        } else {
          throw new Error('No images returned from server');
        }

        // Auto-save if enabled
        let finalUrls = images;
        if (preferences.autoSave) {
          try {
            const saveResponse = await fetch('/api/save-generated-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imageUrls: images,
                prompt,
                projectId: activeProjectId,
              }),
            });

            const saveResult: SaveImageResponse = await saveResponse.json();
            
            if (saveResponse.ok && saveResult.success && saveResult.results) {
              const savedUrls = saveResult.results
                .filter((r) => r.success && r.url)
                .map((r) => r.url!);
              
              if (savedUrls.length > 0) {
                finalUrls = savedUrls;
              }
            }
          } catch (error) {
            console.warn('Auto-save failed:', error);
          }
        }

        // Create generated image objects
        const generatedImages: GeneratedImage[] = finalUrls.map((url) => ({
          id: nanoid(),
          prompt,
          url,
          model: settings.model || 'dall-e-3',
          timestamp: Date.now(),
          settings,
          projectId: activeProjectId || undefined,
          saved: preferences.autoSave,
        }));

        // Update store
        completeGeneration(generationId, generatedImages);
        addToHistory(generatedImages);
        addRecentPrompt(prompt);

        toast.success(`Generated ${generatedImages.length} image(s) successfully!`);
        
        return { success: true, images: generatedImages };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        updateGenerationStatus(generationId, 'failed', errorMsg);
        toast.error(`Image generation failed: ${errorMsg}`);
        
        return { success: false, error: errorMsg };
      }
    },
    [
      startGeneration,
      updateGenerationStatus,
      completeGeneration,
      addToHistory,
      addRecentPrompt,
      preferences.autoSave,
      activeProjectId,
    ]
  );

  return {
    // State
    currentPrompt,
    currentSettings,
    preferences,
    
    // Actions
    generateImages,
    setPrompt,
    updateSettings,
  };
}