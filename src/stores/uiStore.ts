import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIState {
  // Layout preferences
  sidebarCollapsed: boolean;
  historyPanelOpen: boolean;
  compactMode: boolean;
  
  // Display preferences
  showGenerationTime: boolean;
  showModelInfo: boolean;
  gridColumns: 2 | 3 | 4;
  
  // Feature flags
  experimentalFeatures: {
    batchGeneration: boolean;
    advancedSettings: boolean;
    promptTemplates: boolean;
  };
  
  // Actions
  toggleSidebar: () => void;
  toggleHistoryPanel: () => void;
  toggleCompactMode: () => void;
  setGridColumns: (columns: 2 | 3 | 4) => void;
  updateDisplayPreferences: (prefs: Partial<Pick<UIState, 'showGenerationTime' | 'showModelInfo'>>) => void;
  toggleExperimentalFeature: (feature: keyof UIState['experimentalFeatures']) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        sidebarCollapsed: false,
        historyPanelOpen: false,
        compactMode: false,
        showGenerationTime: true,
        showModelInfo: true,
        gridColumns: 3,
        experimentalFeatures: {
          batchGeneration: false,
          advancedSettings: false,
          promptTemplates: false,
        },

        // Actions
        toggleSidebar: () =>
          set((state) => ({
            sidebarCollapsed: !state.sidebarCollapsed,
          })),

        toggleHistoryPanel: () =>
          set((state) => ({
            historyPanelOpen: !state.historyPanelOpen,
          })),

        toggleCompactMode: () =>
          set((state) => ({
            compactMode: !state.compactMode,
          })),

        setGridColumns: (columns) =>
          set({
            gridColumns: columns,
          }),

        updateDisplayPreferences: (prefs) =>
          set((state) => ({
            ...state,
            ...prefs,
          })),

        toggleExperimentalFeature: (feature) =>
          set((state) => ({
            experimentalFeatures: {
              ...state.experimentalFeatures,
              [feature]: !state.experimentalFeatures[feature],
            },
          })),
      }),
      {
        name: 'ui-preferences-storage',
      }
    )
  )
);