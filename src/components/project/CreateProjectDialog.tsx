import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useProject } from "@/providers/ProjectProvider";
import { useSession } from "@/lib/auth-client";

interface ProjectResponse {
  success: boolean;
  project?: {
    id: string;
    name: string;
    description: string | null;
    collaboratorsJson: string | null;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
}

export default function CreateProjectDialog() {
  const { user } = useSession();
  const {
    currentProject,
    allProjects,
    showCreateProject,
    setShowCreateProject,
    setCurrentProject,
    refreshProjects,
  } = useProject();

  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [savingProject, setSavingProject] = useState(false);

  // Create new project or rename untitled project
  const handleCreateProject = useCallback(async () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      setSavingProject(true);

      // Check if we're renaming an "Untitled Project" or creating a new one
      const isRenamingUntitled = currentProject?.name === "Untitled Project";

      const response = await fetch(
        isRenamingUntitled
          ? `/api/project/${currentProject.id}`
          : "/api/project",
        {
          method: isRenamingUntitled ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: newProjectName.trim(),
            description: newProjectDescription.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to create project";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // Not valid JSON
        }
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as ProjectResponse;
      if (data.success && data.project) {
        setCurrentProject(data.project);
        setShowCreateProject(false);
        setNewProjectName("");
        setNewProjectDescription("");

        if (isRenamingUntitled) {
          toast.success("Project renamed successfully");
        } else {
          toast.success("Project created successfully");

          // For first-time users, automatically associate all orphaned files
          const isFirstProject = allProjects.length === 0;
          if (isFirstProject) {
            try {
              // Get all orphaned files (files without a project)
              const filesResponse = await fetch("/api/files?projectId=null", {
                credentials: "include",
              });

              if (filesResponse.ok) {
                const filesData = (await filesResponse.json()) as {
                  success: boolean;
                  files?: any[];
                };

                if (
                  filesData.success &&
                  filesData.files &&
                  filesData.files.length > 0
                ) {
                  console.log(
                    "[DEBUG] First-time user: automatically associating all files with new project"
                  );

                  let associatedCount = 0;
                  for (const file of filesData.files) {
                    try {
                      const updateResponse = await fetch(
                        `/api/files/${file.id}`,
                        {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          credentials: "include",
                          body: JSON.stringify({
                            projectId: data.project.id,
                          }),
                        }
                      );

                      if (updateResponse.ok) {
                        associatedCount++;
                      }
                    } catch (error) {
                      console.error("Error updating file:", file.id, error);
                    }
                  }

                  if (associatedCount > 0) {
                    toast.success(
                      `${associatedCount} file(s) associated with project`
                    );
                  }
                }
              }
            } catch (error) {
              console.error("Error handling files for new project:", error);
            }
          }
        }

        // Refresh projects list
        await refreshProjects();
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create project"
      );
    } finally {
      setSavingProject(false);
    }
  }, [
    newProjectName,
    newProjectDescription,
    currentProject,
    allProjects.length,
    setCurrentProject,
    setShowCreateProject,
    refreshProjects,
  ]);

  return (
    <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentProject?.name === "Untitled Project"
              ? "Name Your Project"
              : allProjects.length === 0
                ? "Create Your First Project"
                : "Create New Project"}
          </DialogTitle>
          {(allProjects.length === 0 ||
            currentProject?.name === "Untitled Project") && (
            <p className="text-sm text-muted-foreground">
              {currentProject?.name === "Untitled Project"
                ? "Give your project a proper name to organize your work."
                : "Give your project a name to save your work. All your files will be associated with this project."}
            </p>
          )}
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="new-project-name" className="text-sm">
              Project Name
            </Label>
            <Input
              id="new-project-name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name"
              disabled={savingProject}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-project-description" className="text-sm">
              Description (Optional)
            </Label>
            <Textarea
              id="new-project-description"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              placeholder="Enter project description"
              disabled={savingProject}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateProject(false)}
              disabled={savingProject}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={savingProject || !newProjectName.trim()}
            >
              {savingProject ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {currentProject?.name === "Untitled Project"
                    ? "Saving..."
                    : "Creating..."}
                </>
              ) : currentProject?.name === "Untitled Project" ? (
                "Save Project"
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
