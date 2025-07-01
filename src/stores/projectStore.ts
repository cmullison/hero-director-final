import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ProjectContext } from './types';

interface ProjectState extends ProjectContext {
  // Actions
  setActiveProject: (projectId: string | null, projectName?: string | null) => void;
  toggleLinkNewContent: () => void;
  clearProjectContext: () => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        activeProjectId: null,
        projectName: null,
        linkNewContent: true,

        // Actions
        setActiveProject: (projectId, projectName = null) =>
          set({
            activeProjectId: projectId,
            projectName: projectName,
          }),

        toggleLinkNewContent: () =>
          set((state) => ({
            linkNewContent: !state.linkNewContent,
          })),

        clearProjectContext: () =>
          set({
            activeProjectId: null,
            projectName: null,
            linkNewContent: true,
          }),
      }),
      {
        name: 'project-context-storage',
      }
    )
  )
);