"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, ChevronRight, FolderOpen, FileText } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useGitHub } from "@/providers/GitHubProvider";
import { toast } from "sonner";
import { FileExplorerHeader } from "./file-explorer/ui/FileExplorerHeader";
import { FileTree } from "./file-explorer/ui/FileTree";
import { EmptyState } from "./file-explorer/ui/EmptyState";
import { RenameFileDialog } from "./file-explorer/dialogs/RenameFileDialog";
import { MoveFileDialog } from "./file-explorer/dialogs/MoveFileDialog";
import { DeleteFileDialog } from "./file-explorer/dialogs/DeleteFileDialog";
import { Button } from "@/components/ui/button";

type FileItem = {
  id: string;
  userId: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
  projectId: string | null;
  path: string | "root";
  collaboratorsJson: string | null;
  codeBody: string;
  version: string | null;
  createdAt: string;
  updatedAt: string;
};

type GitHubFileItem = {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: "file" | "dir";
  download_url: string | null;
};

// Add API response types
interface FilesResponse {
  success: boolean;
  files?: FileItem[];
  file?: FileItem;
  message?: string;
}

interface GitHubFilesResponse {
  contents: GitHubFileItem[];
}

interface FileExplorerProps {
  onFileSelect?: (file: FileItem | GitHubFileItem) => void;
  projectId?: string | null;
}

export function FileExplorer({ onFileSelect, projectId }: FileExplorerProps) {
  const { user, isAuthenticated, loading: authLoading } = useSession();
  const { selectedRepo, selectedBranch, isGitHubMode } = useGitHub();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [githubFiles, setGithubFiles] = useState<GitHubFileItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [currentGitHubPath, setCurrentGitHubPath] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);

  // Add caching to prevent unnecessary refetches
  const loadedDataRef = useRef<{
    projectId: string | null;
    currentFolder: string | null;
    files: FileItem[];
  } | null>(null);
  const isInitialLoadRef = useRef(true);

  // Dialog states
  const [isRenaming, setIsRenaming] = useState(false);
  const [itemToRename, setItemToRename] = useState<FileItem | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [itemToMove, setItemToMove] = useState<FileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FileItem | null>(null);

  // Fetch GitHub files when in GitHub mode
  useEffect(() => {
    if (!isGitHubMode || !selectedRepo) return;

    const fetchGitHubFiles = async () => {
      try {
        setLoading(true);
        const [owner, repoName] = selectedRepo.full_name.split("/");

        const response = await fetch(
          `/api/github/repositories/${owner}/${repoName}/tree/${currentGitHubPath}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch GitHub files");
        }

        const data = (await response.json()) as GitHubFilesResponse;
        if (data.contents) {
          setGithubFiles(data.contents);
        }
      } catch (error) {
        console.error("Error fetching GitHub files:", error);
        toast.error("Failed to load GitHub files");
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubFiles();
  }, [isGitHubMode, selectedRepo, currentGitHubPath]);

  // Fetch files based on current folder and project
  useEffect(() => {
    console.log("[DEBUG] useEffect triggered with:", {
      isAuthenticated,
      authLoading,
      projectId,
      currentFolder,
      hasLoadedData: !!loadedDataRef.current,
      loadedProjectId: loadedDataRef.current?.projectId,
      loadedCurrentFolder: loadedDataRef.current?.currentFolder,
    });

    if (!isAuthenticated && !authLoading) return;

    // Check if we already have this data cached
    const isSameData =
      loadedDataRef.current &&
      loadedDataRef.current.projectId === (projectId ?? null) &&
      loadedDataRef.current.currentFolder === currentFolder;

    console.log("[DEBUG] Cache check:", {
      isSameData,
      isInitialLoad: isInitialLoadRef.current,
      shouldUseCachedData:
        isSameData && !isInitialLoadRef.current && loadedDataRef.current,
    });

    if (isSameData && !isInitialLoadRef.current && loadedDataRef.current) {
      console.log("[DEBUG] Using cached data, skipping fetch");
      setFiles(loadedDataRef.current.files);
      setLoading(false);
      return;
    }

    const fetchFiles = async () => {
      try {
        setLoading(true);

        // Only clear files if we're switching projects, not tabs
        const isProjectChange =
          loadedDataRef.current?.projectId !== (projectId ?? null);

        console.log("[DEBUG] Project change check:", {
          isProjectChange,
          previousProjectId: loadedDataRef.current?.projectId,
          currentProjectId: projectId ?? null,
        });

        if (isProjectChange) {
          console.log("[DEBUG] Project changed - clearing state");
          setFiles([]);
          setCurrentFolder(null);
          setExpandedFolders(new Set());
        }

        console.log("[DEBUG] Starting API call for files");
        const url = new URL("/api/files", window.location.origin);
        if (currentFolder) {
          url.searchParams.append("parentId", currentFolder);
        }
        // Filter by project ID if provided
        if (projectId) {
          url.searchParams.append("projectId", projectId);
          console.log("[DEBUG] Fetching files for projectId:", projectId);
        } else {
          console.log("[DEBUG] Fetching all files (no projectId filter)");
        }

        const response = await fetch(url.toString(), {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }

        const data = (await response.json()) as FilesResponse;
        if (data.success) {
          // Handle both response formats (files array or single file)
          let resultFiles: FileItem[] = [];
          if (data.files) {
            console.log(
              "[DEBUG] Received files:",
              data.files.length,
              "files for projectId:",
              projectId
            );
            console.log(
              "[DEBUG] File details:",
              data.files.map((f) => ({ name: f.name, projectId: f.projectId }))
            );

            // Filter files based on project context
            if (projectId) {
              // When a specific project is selected, only show files for that project
              resultFiles = data.files.filter(
                (file) => file.projectId === projectId
              );
              console.log(
                "[DEBUG] Filtered to",
                resultFiles.length,
                "files for project",
                projectId
              );
            } else {
              // When no project is selected, show files without a project (null projectId)
              resultFiles = data.files.filter(
                (file) => file.projectId === null
              );
              console.log(
                "[DEBUG] Filtered to",
                resultFiles.length,
                "files with no project"
              );
            }
          } else if (data.file) {
            console.log(
              "[DEBUG] Received single file:",
              data.file.name,
              "for projectId:",
              projectId
            );
            // Apply same filtering logic for single file
            if (projectId) {
              resultFiles =
                data.file.projectId === projectId ? [data.file] : [];
            } else {
              resultFiles = data.file.projectId === null ? [data.file] : [];
            }
          } else {
            console.log("[DEBUG] No files received for projectId:", projectId);
            resultFiles = [];
          }

          setFiles(resultFiles);

          // Cache the loaded data
          console.log("[DEBUG] Caching data:", {
            projectId: projectId ?? null,
            currentFolder,
            fileCount: resultFiles.length,
          });
          loadedDataRef.current = {
            projectId: projectId ?? null,
            currentFolder,
            files: resultFiles,
          };
        } else {
          console.error("Error fetching files:", data.message);
          toast.error("Failed to load files");
        }
      } catch (error) {
        console.error("Error fetching files:", error);
        toast.error("Failed to load files");
      } finally {
        setLoading(false);
        isInitialLoadRef.current = false;
      }
    };

    if (isAuthenticated && !authLoading) {
      console.log(
        "[DEBUG] FileExplorer useEffect triggered. projectId:",
        projectId,
        "currentFolder:",
        currentFolder
      );
      fetchFiles();
    }
  }, [currentFolder, isAuthenticated, authLoading, projectId]);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolder(folderId);
  };

  // Get all available folders for selection
  const getAllFolders = (): FileItem[] => {
    return files.filter((item) => item.type === "folder");
  };

  // File creation handled by CreateFileDialog component
  const handleFileCreated = (file: FileItem) => {
    setFiles((prev) => [...prev, file]);
    // Invalidate cache when files are modified
    loadedDataRef.current = null;
  };

  // Dialog handlers
  const handleFileRenamed = (file: FileItem) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === file.id
          ? {
              ...f,
              name: file.name,
              path: file.path,
              updatedAt: file.updatedAt,
              projectId: file.projectId,
              parentId: file.parentId,
            }
          : f
      )
    );
    // Invalidate cache when files are modified
    loadedDataRef.current = null;
  };

  const handleFileMoved = (file: FileItem) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === file.id
          ? {
              ...f,
              parentId: file.parentId,
              path: file.path,
              updatedAt: file.updatedAt,
            }
          : f
      )
    );
    // Invalidate cache when files are modified
    loadedDataRef.current = null;
  };

  const handleFileDeleted = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
    // Invalidate cache when files are modified
    loadedDataRef.current = null;
  };

  const startRename = (item: FileItem) => {
    setItemToRename(item);
    setIsRenaming(true);
  };

  const startMove = (item: FileItem) => {
    setItemToMove(item);
    setIsMoving(true);
  };

  const startDelete = (item: FileItem) => {
    setItemToDelete(item);
    setIsDeleting(true);
  };

  // Empty state when not loading and no files
  if (!loading && files.length === 0 && !authLoading && !isGitHubMode) {
    return (
      <div className="space-y-2">
        <FileExplorerHeader
          currentFolder={currentFolder}
          projectId={projectId}
          availableFolders={getAllFolders()}
          onNavigateBack={() => navigateToFolder(null)}
          onFileCreated={handleFileCreated}
        />
        <EmptyState
          projectId={projectId}
          currentFolder={currentFolder}
          availableFolders={getAllFolders()}
          onFileCreated={handleFileCreated}
        />
      </div>
    );
  }

  // Handle GitHub file selection
  const handleGitHubFileClick = (item: GitHubFileItem) => {
    if (item.type === "dir") {
      setCurrentGitHubPath(item.path);
    } else {
      onFileSelect?.(item);
    }
  };

  // GitHub files display
  const renderGitHubFiles = () => {
    return (
      <div className="space-y-1 px-2 py-1">
        {currentGitHubPath && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-8 px-2 text-xs"
            onClick={() => {
              const parentPath = currentGitHubPath
                .split("/")
                .slice(0, -1)
                .join("/");
              setCurrentGitHubPath(parentPath);
            }}
          >
            <ChevronRight className="h-3 w-3 mr-1 rotate-180" />
            Back
          </Button>
        )}
        {githubFiles.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            size="sm"
            className="w-full justify-start h-8 px-2 text-xs"
            onClick={() => handleGitHubFileClick(item)}
          >
            {item.type === "dir" ? (
              <FolderOpen className="h-3 w-3 mr-1.5 text-blue-500" />
            ) : (
              <FileText className="h-3 w-3 mr-1.5" />
            )}
            <span className="truncate">{item.name}</span>
            {item.type === "file" && (
              <span className="ml-auto text-muted-foreground">
                {(item.size / 1024).toFixed(1)}KB
              </span>
            )}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <FileExplorerHeader
        currentFolder={currentFolder}
        projectId={projectId}
        availableFolders={getAllFolders()}
        onNavigateBack={() => navigateToFolder(null)}
        onFileCreated={handleFileCreated}
      />

      {/* Dialog Components */}
      <RenameFileDialog
        isOpen={isRenaming}
        onOpenChange={setIsRenaming}
        item={itemToRename}
        onFileRenamed={handleFileRenamed}
      />

      <MoveFileDialog
        isOpen={isMoving}
        onOpenChange={setIsMoving}
        item={itemToMove}
        availableFolders={getAllFolders()}
        onFileMoved={handleFileMoved}
      />

      <DeleteFileDialog
        isOpen={isDeleting}
        onOpenChange={setIsDeleting}
        item={itemToDelete}
        onFileDeleted={handleFileDeleted}
      />

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : isGitHubMode ? (
        renderGitHubFiles()
      ) : (
        <FileTree
          files={files}
          expandedFolders={expandedFolders}
          processingAction={processingAction}
          projectId={projectId}
          currentFolder={currentFolder}
          availableFolders={getAllFolders()}
          onToggleFolder={toggleFolder}
          onFileSelect={onFileSelect}
          onRename={startRename}
          onMove={startMove}
          onDelete={startDelete}
          onFileCreated={handleFileCreated}
        />
      )}
    </div>
  );
}
