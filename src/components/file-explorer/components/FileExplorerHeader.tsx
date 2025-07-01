"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
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

interface FileExplorerHeaderProps {
  projectId?: string | null;
  currentFolder: string | null;
  availableFolders: FileItem[];
  onFileCreated: (file: FileItem) => void;
  onNavigateToFolder: (folderId: string | null) => void;
}

export function FileExplorerHeader({
  projectId,
  currentFolder,
  availableFolders,
  onFileCreated,
  onNavigateToFolder,
}: FileExplorerHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium">Files</h3>
      <div className="flex items-center gap-1">
        {currentFolder && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onNavigateToFolder(null)}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Button>
        )}
        <CreateFileDialog
          projectId={projectId}
          currentFolder={currentFolder}
          availableFolders={availableFolders}
          onFileCreated={onFileCreated}
        />
      </div>
    </div>
  );
}
