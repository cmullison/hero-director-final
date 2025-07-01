import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GeneratedImage, ImageGenerationSettings, GenerationRequest, UserPreferences } from './types';

interface ImageGenerationState {
  // Current generation state
  currentPrompt: string;
  currentSettings: ImageGenerationSettings;
  
  // Active generations
  activeGenerations: Map<string, GenerationRequest>;
  
  // History
  generationHistory: GeneratedImage[];
  
  // User preferences
  preferences: UserPreferences;
  
  // Recent prompts for autocomplete
  recentPrompts: string[];
  
  // Actions
  setPrompt: (prompt: string) => void;
  updateSettings: (settings: Partial<ImageGenerationSettings>) => void;
  startGeneration: (id: string, prompt: string, settings: ImageGenerationSettings) => void;
  updateGenerationStatus: (id: string, status: GenerationRequest['status'], error?: string) => void;
  completeGeneration: (id: string, images: GeneratedImage[]) => void;
  addToHistory: (images: GeneratedImage[]) => void;
  clearHistory: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  addRecentPrompt: (prompt: string) => void;
  markImageSaved: (imageId: string) => void;
  removeFromHistory: (imageId: string) => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultModel: 'dall-e-3',
  defaultQuality: 'standard',
  defaultSize: '1024x1024',
  defaultN: 1,
  autoSave: false,
  historyLimit: 50,
};

export const useImageGenerationStore = create<ImageGenerationState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentPrompt: '',
        currentSettings: {
          quality: DEFAULT_PREFERENCES.defaultQuality,
          size: DEFAULT_PREFERENCES.defaultSize,
          n: DEFAULT_PREFERENCES.defaultN,
          model: DEFAULT_PREFERENCES.defaultModel,
        },
        activeGenerations: new Map(),
        generationHistory: [],
        preferences: DEFAULT_PREFERENCES,
        recentPrompts: [],

        // Actions
        setPrompt: (prompt) => set({ currentPrompt: prompt }),

        updateSettings: (settings) =>
          set((state) => ({
            currentSettings: { ...state.currentSettings, ...settings },
          })),

        startGeneration: (id, prompt, settings) =>
          set((state) => {
            const newMap = new Map(state.activeGenerations);
            newMap.set(id, {
              id,
              prompt,
              status: 'generating',
              startTime: Date.now(),
            });
            return { activeGenerations: newMap };
          }),

        updateGenerationStatus: (id, status, error) =>
          set((state) => {
            const newMap = new Map(state.activeGenerations);
            const generation = newMap.get(id);
            if (generation) {
              newMap.set(id, { ...generation, status, error });
            }
            return { activeGenerations: newMap };
          }),

        completeGeneration: (id, images) =>
          set((state) => {
            const newMap = new Map(state.activeGenerations);
            const generation = newMap.get(id);
            if (generation) {
              newMap.set(id, {
                ...generation,
                status: 'completed',
                result: images,
                endTime: Date.now(),
              });
              // Remove from active after a delay
              setTimeout(() => {
                const store = get();
                const updatedMap = new Map(store.activeGenerations);
                updatedMap.delete(id);
                set({ activeGenerations: updatedMap });
              }, 5000);
            }
            return { activeGenerations: newMap };
          }),

        addToHistory: (images) =>
          set((state) => {
            const newHistory = [...images, ...state.generationHistory];
            // Limit history size
            if (newHistory.length > state.preferences.historyLimit) {
              newHistory.length = state.preferences.historyLimit;
            }
            return { generationHistory: newHistory };
          }),

        clearHistory: () => set({ generationHistory: [] }),

        updatePreferences: (prefs) =>
          set((state) => ({
            preferences: { ...state.preferences, ...prefs },
            // Update current settings with new defaults
            currentSettings: {
              ...state.currentSettings,
              quality: prefs.defaultQuality || state.currentSettings.quality,
              size: prefs.defaultSize || state.currentSettings.size,
              n: prefs.defaultN || state.currentSettings.n,
              model: prefs.defaultModel || state.currentSettings.model,
            },
          })),

        addRecentPrompt: (prompt) =>
          set((state) => {
            const filtered = state.recentPrompts.filter((p) => p !== prompt);
            const newPrompts = [prompt, ...filtered].slice(0, 20); // Keep last 20
            return { recentPrompts: newPrompts };
          }),

        markImageSaved: (imageId) =>
          set((state) => ({
            generationHistory: state.generationHistory.map((img) =>
              img.id === imageId ? { ...img, saved: true } : img
            ),
          })),

        removeFromHistory: (imageId) =>
          set((state) => ({
            generationHistory: state.generationHistory.filter((img) => img.id !== imageId),
          })),
      }),
      {
        name: 'image-generation-storage',
        partialize: (state) => ({
          generationHistory: state.generationHistory.slice(0, 20), // Only persist last 20
          preferences: state.preferences,
          recentPrompts: state.recentPrompts,
          currentSettings: state.currentSettings,
        }),
      }
    )
  )
);