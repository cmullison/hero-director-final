"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  MoreVertical,
  Edit,
  Move,
  Trash2,
} from "lucide-react";

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

interface FileItemProps {
  item: FileItem;
  depth?: number;
  isExpanded?: boolean;
  processingAction?: boolean;
  onToggleFolder: (id: string) => void;
  onFileSelect?: (file: FileItem) => void;
  onStartRename: (item: FileItem) => void;
  onStartMove: (item: FileItem) => void;
  onStartDelete: (item: FileItem) => void;
  children?: React.ReactNode;
}

export function FileItemComponent({
  item,
  depth = 0,
  isExpanded = false,
  processingAction = false,
  onToggleFolder,
  onFileSelect,
  onStartRename,
  onStartMove,
  onStartDelete,
  children,
}: FileItemProps) {
  return (
    <div>
      <div
        className={`group flex items-center gap-1 rounded-md px-2 py-1 hover:bg-muted`}
        style={{ marginLeft: depth * 12 }}
      >
        {item.type === "folder" ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4"
            onClick={() => onToggleFolder(item.id)}
          >
            <ChevronRight
              className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            />
          </Button>
        ) : (
          <div className="w-4" />
        )}
        <div
          className="flex items-center cursor-pointer gap-1 flex-1"
          onClick={() => {
            if (item.type === "folder") {
              onToggleFolder(item.id);
            } else if (onFileSelect) {
              onFileSelect(item);
            }
          }}
        >
          {item.type === "folder" ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <File className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-xs">{item.name}</span>
        </div>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                disabled={processingAction}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onStartRename(item)}>
                <Edit className="h-3.5 w-3.5 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStartMove(item)}>
                <Move className="h-3.5 w-3.5 mr-2" />
                Move
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStartDelete(item)}>
                <Trash2 className="h-3.5 w-3.5 mr-2 text-destructive" />
                <span className="text-destructive">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {children}
    </div>
  );
}
