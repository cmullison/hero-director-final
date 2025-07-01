import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  ChevronRight,
  File,
  Folder,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useProject } from "@/providers/ProjectProvider";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "@/components/ui/sidebar";

// Import dialogs from the existing file explorer
import { RenameFileDialog } from "./file-explorer/dialogs/RenameFileDialog";
import { MoveFileDialog } from "./file-explorer/dialogs/MoveFileDialog";
import { DeleteFileDialog } from "./file-explorer/dialogs/DeleteFileDialog";
import { CreateFileDialog } from "./file-explorer/dialogs/CreateFileDialog";
import { Button } from "./ui/button";

// Type definitions
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

interface FilesResponse {
  success: boolean;
  files?: FileItem[];
  file?: FileItem;
  message?: string;
}

interface CodeSidebarProps {
  className?: string;
}

// Helper function to organize files hierarchically
const organizeFolderStructure = (
  items: FileItem[],
  parentId: string | null = null
): FileItem[] => {
  return items
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => {
      // Sort folders first, then files
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      // Then alphabetically by name
      return a.name.localeCompare(b.name);
    });
};

export function CodeSidebar({}: CodeSidebarProps &
  React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useSession();
  const { currentProject, setSelectedFile } = useProject();
  const projectId = currentProject?.id || null;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cache to prevent unnecessary refetches
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

  // Only show on editor routes
  const isEditorRoute = location.pathname.startsWith("/dashboard/editor");

  // Function to render the hierarchical file tree
  const renderFileTree = (allFiles: FileItem[]): React.ReactNode[] => {
    const rootFiles = organizeFolderStructure(allFiles, null);

    return rootFiles.map((item) => (
      <Tree
        key={item.id}
        item={item}
        allFiles={allFiles}
        expandedFolders={expandedFolders}
        onToggleFolder={toggleFolder}
        onFileSelect={setSelectedFile}
        onRename={startRename}
        onMove={startMove}
        onDelete={startDelete}
      />
    ));
  };

  // Fetch files based on current folder and project
  useEffect(() => {
    if (!isAuthenticated && !authLoading) return;
    if (!isEditorRoute) return; // Don't fetch if not on editor route

    const isSameData =
      loadedDataRef.current &&
      loadedDataRef.current.projectId === (projectId ?? null) &&
      loadedDataRef.current.currentFolder === currentFolder;

    if (isSameData && !isInitialLoadRef.current && loadedDataRef.current) {
      setFiles(loadedDataRef.current.files);
      setLoading(false);
      return;
    }

    const fetchFiles = async () => {
      try {
        setLoading(true);

        const isProjectChange =
          loadedDataRef.current?.projectId !== (projectId ?? null);

        if (isProjectChange) {
          setFiles([]);
          setCurrentFolder(null);
          setExpandedFolders(new Set());
        }

        const url = new URL("/api/files", window.location.origin);
        if (currentFolder) {
          url.searchParams.append("parentId", currentFolder);
        }
        if (projectId) {
          url.searchParams.append("projectId", projectId);
        }

        const response = await fetch(url.toString(), {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }

        const data = (await response.json()) as FilesResponse;
        if (data.success) {
          let resultFiles: FileItem[] = [];
          if (data.files) {
            if (projectId) {
              resultFiles = data.files.filter(
                (file) => file.projectId === projectId
              );
            } else {
              resultFiles = data.files.filter(
                (file) => file.projectId === null
              );
            }
          } else if (data.file) {
            if (projectId) {
              resultFiles =
                data.file.projectId === projectId ? [data.file] : [];
            } else {
              resultFiles = data.file.projectId === null ? [data.file] : [];
            }
          } else {
            resultFiles = [];
          }

          setFiles(resultFiles);

          loadedDataRef.current = {
            projectId: projectId ?? null,
            currentFolder,
            files: resultFiles,
          };
        } else {
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
      fetchFiles();
    }
  }, [currentFolder, isAuthenticated, authLoading, projectId, isEditorRoute]);

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

  // Get all available folders for selection
  const getAllFolders = (): FileItem[] => {
    return files.filter((item) => item.type === "folder");
  };

  // Event handlers
  const handleFileCreated = (file: FileItem) => {
    setFiles((prev) => [...prev, file]);
    loadedDataRef.current = null;
  };

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
    loadedDataRef.current = null;
  };

  const handleFileDeleted = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
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

  // Get file count by type for the Changes section
  const changes = files
    .filter((f) => f.type === "file")
    .slice(0, 3)
    .map((file) => ({
      file: file.name,
      state: "M", // Mock state for now
    }));

  // Don't render if not on editor route
  if (!isEditorRoute) {
    return null;
  }
  return (
    <>
      <Sidebar
        collapsible="none"
        className="border-l"
        style={
          {
            "--sidebar-width": "280px",
          } as React.CSSProperties
        }
      >
        <SidebarHeader className="gap-2 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">Files</div>
            <CreateFileDialog
              projectId={projectId}
              currentFolder={currentFolder}
              availableFolders={getAllFolders()}
              onFileCreated={handleFileCreated}
            />
          </div>
        </SidebarHeader>
        <SidebarContent>
          {/* Changes Section */}
          {changes.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Changes</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {changes.map((item, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton>
                        <File className="h-4 w-4" />
                        {item.file}
                      </SidebarMenuButton>
                      <SidebarMenuBadge>{item.state}</SidebarMenuBadge>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Files Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Project Files</SidebarGroupLabel>
            <SidebarGroupContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : files.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-4">
                  No files found
                </div>
              ) : (
                <SidebarMenu>{renderFileTree(files)}</SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

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
    </>
  );
}

// Tree component for rendering file structure
function Tree({
  item,
  allFiles,
  expandedFolders,
  onToggleFolder,
  onFileSelect,
  onRename,
  onMove,
  onDelete,
}: {
  item: FileItem;
  allFiles: FileItem[];
  expandedFolders: Set<string>;
  onToggleFolder: (id: string) => void;
  onFileSelect?: (file: { id: string; name: string; type: string }) => void;
  onRename: (item: FileItem) => void;
  onMove: (item: FileItem) => void;
  onDelete: (item: FileItem) => void;
}) {
  const isExpanded = expandedFolders.has(item.id);

  if (item.type === "file") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() =>
            onFileSelect?.({ id: item.id, name: item.name, type: item.type })
          }
          className="data-[active=true]:bg-transparent"
        >
          <File className="h-4 w-4" />
          {item.name}
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction showOnHover>
              <MoreHorizontal className="h-4 w-4" />
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            <DropdownMenuItem onClick={() => onRename(item)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMove(item)}>
              Move
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(item)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        open={isExpanded}
        onOpenChange={() => onToggleFolder(item.id)}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRight
              className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
            />
            <Folder className="h-4 w-4" />
            {item.name}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction showOnHover>
              <MoreHorizontal className="h-4 w-4" />
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            <DropdownMenuItem onClick={() => onRename(item)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMove(item)}>
              Move
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(item)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <CollapsibleContent>
          <SidebarMenuSub>
            {organizeFolderStructure(allFiles, item.id).map(
              (child: FileItem) => (
                <Tree
                  key={child.id}
                  item={child}
                  allFiles={allFiles}
                  expandedFolders={expandedFolders}
                  onToggleFolder={onToggleFolder}
                  onFileSelect={onFileSelect}
                  onRename={onRename}
                  onMove={onMove}
                  onDelete={onDelete}
                />
              )
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
