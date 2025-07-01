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
  processingAction: boolean;
  projectId?: string | null;
  currentFolder: string | null;
  availableFolders: FileItem[];
  onToggleFolder: (id: string) => void;
  onFileSelect?: (file: FileItem) => void;
  onRename: (item: FileItem) => void;
  onMove: (item: FileItem) => void;
  onDelete: (item: FileItem) => void;
  onFileCreated: (file: FileItem) => void;
}

export function FileTree({
  files,
  expandedFolders,
  processingAction,
  projectId,
  currentFolder,
  availableFolders,
  onToggleFolder,
  onFileSelect,
  onRename,
  onMove,
  onDelete,
  onFileCreated,
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
    const children = organizeFolderStructure(files, item.id);

    return (
      <FileItemComponent
        key={item.id}
        item={item}
        depth={depth}
        isExpanded={isExpanded}
        processingAction={processingAction}
        onToggleFolder={onToggleFolder}
        onFileSelect={onFileSelect}
        onRename={onRename}
        onMove={onMove}
        onDelete={onDelete}
      >
        {item.type === "folder" && isExpanded && (
          <div className="pb-1">
            {children.map((child) => renderFileItem(child, depth + 1))}
            {children.length === 0 && (
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

  const rootFiles = organizeFolderStructure(files);

  if (rootFiles.length === 0) {
    return (
      <EmptyState
        projectId={projectId}
        currentFolder={currentFolder}
        availableFolders={availableFolders}
        onFileCreated={onFileCreated}
        isInFolder={!!currentFolder}
      />
    );
  }

  return (
    <div className="space-y-1">
      {rootFiles.map((file) => renderFileItem(file))}
    </div>
  );
}
