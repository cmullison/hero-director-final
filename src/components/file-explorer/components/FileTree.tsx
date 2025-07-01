"use client";

import { FileItemComponent } from "./FileItem";
import { EmptyState } from "./EmptyState";

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

interface FileTreeProps {
  files: FileItem[];
  expandedFolders: Set<string>;
  projectId?: string | null;
  currentFolder?: string | null;
  processingAction?: boolean;
  onToggleFolder: (id: string) => void;
  onFileSelect?: (file: FileItem) => void;
  onStartRename: (item: FileItem) => void;
  onStartMove: (item: FileItem) => void;
  onStartDelete: (item: FileItem) => void;
  onFileCreated: (file: FileItem) => void;
  getAllFolders: () => FileItem[];
}

export function FileTree({
  files,
  expandedFolders,
  projectId,
  currentFolder,
  processingAction = false,
  onToggleFolder,
  onFileSelect,
  onStartRename,
  onStartMove,
  onStartDelete,
  onFileCreated,
  getAllFolders,
}: FileTreeProps) {
  // Build a hierarchical structure for files
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

  const renderFileItem = (item: FileItem, depth = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(item.id);

    return (
      <FileItemComponent
        key={item.id}
        item={item}
        depth={depth}
        isExpanded={isExpanded}
        processingAction={processingAction}
        onToggleFolder={onToggleFolder}
        onFileSelect={onFileSelect}
        onStartRename={onStartRename}
        onStartMove={onStartMove}
        onStartDelete={onStartDelete}
      >
        {item.type === "folder" && isExpanded && (
          <div className="pb-1">
            {organizeFolderStructure(files, item.id).map((child) =>
              renderFileItem(child, depth + 1)
            )}
            {organizeFolderStructure(files, item.id).length === 0 && (
              <div
                className="text-xs text-muted-foreground px-2 py-1"
                style={{ marginLeft: (depth + 1) * 12 }}
              >
                Empty folder
              </div>
            )}
          </div>
        )}
      </FileItemComponent>
    );
  };

  const organizedFiles = organizeFolderStructure(files);

  if (organizedFiles.length === 0) {
    return (
      <EmptyState
        projectId={projectId}
        currentFolder={currentFolder}
        availableFolders={getAllFolders()}
        onFileCreated={onFileCreated}
        isInFolder={!!currentFolder}
      />
    );
  }

  return (
    <div className="space-y-1">
      {organizedFiles.map((file) => renderFileItem(file))}
    </div>
  );
}
