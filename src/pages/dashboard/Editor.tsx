"use client";

import { useCallback, useRef, useState } from "react";
import {
  CodeEditor,
  type CodeEditorRef,
} from "@/components/file-explorer/code-editor";
import { useSession } from "@/lib/auth-client";
import { useProject } from "@/providers/ProjectProvider";
import { useGitHub } from "@/providers/GitHubProvider";
import { toast } from "sonner";

export default function EditorPage() {
  const { user } = useSession();
  const { selectedFile, currentProject, setShowCreateProject } = useProject();
  const { selectedRepo, isGitHubMode } = useGitHub();
  const codeEditorRef = useRef<CodeEditorRef>(null);
  const [selectedGitHubFile, setSelectedGitHubFile] = useState<{
    path: string;
    name: string;
    content?: string;
  } | null>(null);

  // Handle file selection from FileExplorer
  const handleFileSelect = useCallback((file: any) => {
    // Check if it's a GitHub file (has 'path' and 'sha' properties)
    if (file.path && file.sha) {
      setSelectedGitHubFile({
        path: file.path,
        name: file.name,
      });
    }
    // Otherwise it's handled by the ProjectProvider for local files
  }, []);

  // Handle file saving
  const handleSaveFile = useCallback(
    async (id: string, codeBody: string) => {
      if (!user) {
        toast.error("You must be logged in to save files");
        return;
      }

      // Check if we have an active project
      if (!currentProject?.id) {
        toast.error(
          "You must create a project first. Click the Save button in the title bar to create a project."
        );
        return;
      }

      try {
        // Ensure code body is not empty
        if (!codeBody.trim()) {
          throw new Error("Cannot save empty file");
        }

        const response = await fetch(`/api/files/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            codeBody,
            projectId: currentProject.id, // Ensure file is associated with current project
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = "Failed to save file";
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            // Not valid JSON
          }
          throw new Error(errorMessage);
        }

        // No need to update the selected file since the CodeEditor will
        // reload it if needed via its own API call
      } catch (error) {
        console.error("Error saving file:", error);
        throw error; // Re-throw to let CodeEditor handle the error display
      }
    },
    [user, currentProject]
  );

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col relative">
          <div className="flex-1 overflow-auto">
            <div className="h-full">
              <CodeEditor
                ref={codeEditorRef}
                selectedFile={selectedFile}
                selectedGitHubFile={selectedGitHubFile}
                isGitHubMode={isGitHubMode}
                selectedRepo={selectedRepo}
                onSave={handleSaveFile}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
