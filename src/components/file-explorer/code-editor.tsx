"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import type { KeyboardEvent } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import CodeEditorComponent from "@uiw/react-textarea-code-editor";
import { useTheme } from "next-themes";

// Define the ref interface for parent component access
export interface CodeEditorRef {
  getCurrentCode: () => string;
  isEdited: () => boolean;
  save: () => Promise<void>;
  getSelectedFile: () => { id: string; name: string; type: string } | null;
}

// Define the props interface to receive the selected file from parent
interface CodeEditorProps {
  selectedFile?: {
    id: string;
    name: string;
    type: string;
  } | null;
  selectedGitHubFile?: {
    path: string;
    name: string;
    content?: string;
  } | null;
  isGitHubMode?: boolean;
  selectedRepo?: {
    full_name: string;
  } | null;
  onSave?: (id: string, codeBody: string) => Promise<void>;
}

export const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(
  (
    { selectedFile, selectedGitHubFile, isGitHubMode, selectedRepo, onSave },
    ref
  ) => {
    const [code, setCode] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const [edited, setEdited] = useState(false);
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();

    // Theme colors matching highlight.js atom-one themes
    const themeColors = {
      dark: {
        background: "#282c34",
        color: "#abb2bf",
        borderColor: "#3e4451",
      },
      light: {
        background: "#fafafa",
        color: "#383a42",
        borderColor: "#e5e5e6",
      },
    };

    const currentTheme =
      theme === "dark" ? themeColors.dark : themeColors.light;

    // Load selected file's code when it changes
    useEffect(() => {
      const fetchFileContent = async () => {
        // Handle GitHub files
        if (isGitHubMode && selectedGitHubFile) {
          setLoading(true);
          try {
            // If content is already provided, use it
            if (selectedGitHubFile.content) {
              setCode(selectedGitHubFile.content);
              setEdited(false);
              return;
            }

            // Otherwise fetch from GitHub
            if (!selectedRepo) {
              setCode("// No GitHub repository selected");
              return;
            }

            const [owner, repoName] = selectedRepo.full_name.split("/");
            const response = await fetch(
              `/api/github/repositories/${owner}/${repoName}/contents/${selectedGitHubFile.path}`,
              {
                credentials: "include",
              }
            );

            if (!response.ok) {
              throw new Error("Failed to fetch GitHub file content");
            }

            const data = (await response.json()) as {
              content: string;
              sha: string;
            };
            setCode(data.content);
            setEdited(false);
          } catch (error) {
            console.error("Error fetching GitHub file:", error);
            toast.error("Failed to load GitHub file");
            setCode("// Error loading GitHub file");
          } finally {
            setLoading(false);
          }
          return;
        }

        // Handle local files
        if (!selectedFile) {
          setCode("// Select a file from the file explorer to begin editing");
          setEdited(false);
          return;
        }

        try {
          setLoading(true);

          // Directly fetch the file content by ID
          const response = await fetch(`/api/files/${selectedFile.id}`, {
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error("Failed to fetch file content");
          }

          const data = (await response.json()) as {
            success: boolean;
            file?: {
              id: string;
              name: string;
              codeBody?: string;
            };
          };

          if (data.success && data.file) {
            setCode(data.file.codeBody || "// Add your code here");
          } else {
            setCode("// File content could not be loaded");
          }
          setEdited(false);
        } catch (error) {
          console.error("Error fetching file content:", error);
          toast.error("Failed to load file content");
          setCode("// Error loading file content");
        } finally {
          setLoading(false);
        }
      };

      fetchFileContent();
    }, [selectedFile, selectedGitHubFile, isGitHubMode, selectedRepo]);

    // Handle code changes
    const handleCodeChange = (value: string) => {
      setCode(value);
      setEdited(true);
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Handle Ctrl+S for save
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    };

    // Save the current code to the database
    const handleSave = async () => {
      if (isGitHubMode) {
        toast.info("GitHub file editing is not yet supported");
        return;
      }

      if (!selectedFile) {
        toast.error("No file selected");
        return;
      }

      if (!onSave) {
        toast.error("Save functionality not available");
        return;
      }

      try {
        setSaving(true);
        await onSave(selectedFile.id, code);
        setEdited(false);
        toast.success("File saved successfully");
      } catch (error) {
        console.error("Error saving file:", error);
        toast.error("Failed to save file");
      } finally {
        setSaving(false);
      }
    };

    // Calculate line count
    const lineCount = code.split("\n").length;

    // Expose the necessary functions to the parent component
    useImperativeHandle(ref, () => ({
      getCurrentCode: () => code,
      isEdited: () => edited,
      save: handleSave,
      getSelectedFile: () => selectedFile || null,
    }));

    return (
      <div className="h-full w-full bg-background flex flex-col">
        {/* Editor Container */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          <div className="h-full">
            <CodeEditorComponent
              value={code}
              language="js"
              placeholder="Start typing your code..."
              onChange={(evn: any) => handleCodeChange(evn.target.value)}
              onKeyDown={handleKeyDown}
              padding={15}
              style={{
                fontSize: 14,
                backgroundColor: currentTheme.background,
                color: currentTheme.color,
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                height: "100%",
                overflow: "auto",
                borderColor: currentTheme.borderColor,
              }}
              data-color-mode={theme === "dark" ? "dark" : "light"}
            />
          </div>

          {/* Footer Info */}
          <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Lines: {lineCount} | Ctrl+S to save
          </div>
        </div>
      </div>
    );
  }
);

CodeEditor.displayName = "CodeEditor";
