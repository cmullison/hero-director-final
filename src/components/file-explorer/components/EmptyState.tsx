"use client";

import { Button } from "@/components/ui/button";
import { FileBox, PlusIcon } from "lucide-react";
import { CreateFileDialog } from "../dialogs/CreateFileDialog";

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

interface EmptyStateProps {
  projectId?: string | null;
  currentFolder?: string | null;
  availableFolders: FileItem[];
  onFileCreated: (file: FileItem) => void;
  isInFolder?: boolean;
}

export function EmptyState({
  projectId,
  currentFolder,
  availableFolders,
  onFileCreated,
  isInFolder = false,
}: EmptyStateProps) {
  const emptyMessage = isInFolder
    ? "No files in this folder"
    : projectId
      ? "No files in this project"
      : "No files yet";

  const emptySubMessage = isInFolder
    ? "Start by creating your first file or folder"
    : projectId
      ? "Start by creating your first file or folder for this project"
      : "Start by creating your first file or folder";

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <FileBox className="h-12 w-12 text-muted-foreground mb-2" />
      <h3 className="text-sm font-medium">{emptyMessage}</h3>
      <p className="text-xs text-muted-foreground mb-4">{emptySubMessage}</p>
      <CreateFileDialog
        projectId={projectId}
        currentFolder={currentFolder}
        availableFolders={availableFolders}
        onFileCreated={onFileCreated}
        trigger={
          <Button size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New
          </Button>
        }
      />
    </div>
  );
}
