import { ChevronRight, Github, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateFileDialog } from "../dialogs/CreateFileDialog";
import { Toggle } from "@/components/ui/toggle";

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
  currentFolder: string | null;
  projectId?: string | null;
  availableFolders: FileItem[];
  onNavigateBack: () => void;
  onFileCreated: (file: FileItem) => void;
}

export function FileExplorerHeader({
  currentFolder,
  projectId,
  availableFolders,
  onNavigateBack,
  onFileCreated,
}: FileExplorerHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">Files</h3>
      </div>
      <div className="flex items-center gap-1">
        {currentFolder && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onNavigateBack}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Button>
        )}
        {
          <CreateFileDialog
            projectId={projectId}
            currentFolder={currentFolder}
            availableFolders={availableFolders}
            onFileCreated={onFileCreated}
          />
        }
      </div>
    </div>
  );
}
