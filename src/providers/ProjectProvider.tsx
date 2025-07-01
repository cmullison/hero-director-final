import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string | null;
  collaboratorsJson: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SelectedFile {
  id: string;
  name: string;
  type: string;
}

interface ProjectsResponse {
  success: boolean;
  projects?: Project[];
  message?: string;
}

interface ProjectResponse {
  success: boolean;
  project?: Project;
  message?: string;
}

interface ProjectContextType {
  currentProject: Project | null;
  allProjects: Project[];
  projectLoading: boolean;
  selectedFile: SelectedFile | null;
  showCreateProject: boolean;
  setCurrentProject: (project: Project | null) => void;
  handleProjectSwitch: (project: Project) => void;
  setSelectedFile: (file: SelectedFile | null) => void;
  setShowCreateProject: (show: boolean) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

interface ProjectProviderProps {
  children: React.ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const { user } = useSession();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [projectLoading, setProjectLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);

  // Load projects when user is available
  const refreshProjects = useCallback(async () => {
    if (!user) return;

    try {
      setProjectLoading(true);
      const response = await fetch("/api/project", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load projects");
      }

      const data = (await response.json()) as ProjectsResponse;
      if (data.success && data.projects) {
        console.log("[ProjectProvider] Loaded projects:", data.projects.length);
        setAllProjects(data.projects);

        if (data.projects.length > 0 && !currentProject) {
          const project = data.projects[0]; // Get the first/most recent project
          console.log(
            "[ProjectProvider] Setting initial project:",
            project.id,
            project.name
          );
          setCurrentProject(project);
        }
      } else {
        console.log(
          "[ProjectProvider] No projects found - creating initial project"
        );
        // Create an initial "Untitled Project" for new users
        try {
          const createResponse = await fetch("/api/project", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              name: "Untitled Project",
              description: null,
            }),
          });

          if (createResponse.ok) {
            const createData = (await createResponse.json()) as ProjectResponse;
            if (createData.success && createData.project) {
              console.log(
                "[ProjectProvider] Created initial project:",
                createData.project.id
              );
              setCurrentProject(createData.project);
              setAllProjects([createData.project]);
            }
          }
        } catch (error) {
          console.error("Error creating initial project:", error);
        }
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setProjectLoading(false);
    }
  }, [user, currentProject]);

  useEffect(() => {
    refreshProjects();
  }, [user]);

  const handleProjectSwitch = useCallback((project: Project) => {
    console.log(
      "[ProjectProvider] Switching to project:",
      project.id,
      project.name
    );
    setCurrentProject(project);
    // Clear selected file when switching projects
    setSelectedFile(null);
  }, []);

  const value: ProjectContextType = {
    currentProject,
    allProjects,
    projectLoading,
    selectedFile,
    showCreateProject,
    setCurrentProject,
    handleProjectSwitch,
    setSelectedFile,
    setShowCreateProject,
    refreshProjects,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}
