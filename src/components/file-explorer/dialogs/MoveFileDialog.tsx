"use client";

import { useState, useEffect } from "react";
import { Loader2, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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

interface FileActionResponse {
  success: boolean;
  file?: FileItem;
  message?: string;
}

interface MoveFileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: FileItem | null;
  availableFolders: FileItem[];
  onFileMoved: (file: FileItem) => void;
}

export function MoveFileDialog({
  isOpen,
  onOpenChange,
  item,
  availableFolders,
  onFileMoved,
}: MoveFileDialogProps) {
  const [moveDestinationId, setMoveDestinationId] = useState<string | null>(
    null
  );
  const [processingAction, setProcessingAction] = useState(false);

  // Update moveDestinationId when item changes
  useEffect(() => {
    if (item) {
      setMoveDestinationId(item.parentId);
    }
  }, [item]);

  const moveItem = async () => {
    if (!item) {
      toast.error("No item selected to move");
      return;
    }

    // Check if trying to move to the same location
    if (moveDestinationId === item.parentId) {
      toast.error("Item is already in the selected location");
      return;
    }

    // Prevent moving a folder into itself or its descendants
    if (item.type === "folder" && moveDestinationId === item.id) {
      toast.error("Cannot move a folder into itself");
      return;
    }

    try {
      setProcessingAction(true);
      console.log("[DEBUG] Moving item:", {
        id: item.id,
        name: item.name,
        type: item.type,
        currentParentId: item.parentId,
        newParentId: moveDestinationId,
      });

      const response = await fetch(`/api/files/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: item.id,
          name: item.name,
          type: item.type,
          parentId: moveDestinationId,
          path: moveDestinationId || "root",
          projectId: item.projectId,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[DEBUG] Move error response:", errorText);
        let errorMessage = "Failed to move item";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // Text wasn't JSON
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      console.log("[DEBUG] Move raw response:", responseText);

      if (!responseText.trim()) {
        console.error("[DEBUG] Empty response from server");
        toast.error("Server returned an empty response");
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText) as FileActionResponse;
        console.log("[DEBUG] Move parsed response:", data);
      } catch (parseError) {
        console.error("[DEBUG] Failed to parse move response:", parseError);
        toast.error("Server returned invalid JSON");
        return;
      }

      if (data.success && data.file) {
        console.log(
          "[DEBUG] Move successful, updating file in state:",
          data.file
        );
        onFileMoved(data.file);
        onOpenChange(false);
        setMoveDestinationId(null);
        toast.success("Item moved successfully");
      } else {
        console.error("[DEBUG] Missing file data in move response:", data);
        toast.error(
          "Item might have been moved but response format was incorrect"
        );
      }
    } catch (error) {
      console.error("[DEBUG] Error moving item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to move item"
      );
    } finally {
      setProcessingAction(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move {item?.type}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Move "{item?.name}" to:</Label>
            <Select
              value={moveDestinationId || "root"}
              onValueChange={(value) =>
                setMoveDestinationId(value === "root" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select destination folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    Root folder
                  </div>
                </SelectItem>
                {availableFolders
                  .filter((folder) => folder.id !== item?.id) // Prevent moving folder into itself
                  .map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={moveItem} disabled={processingAction}>
              {processingAction && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Move
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
