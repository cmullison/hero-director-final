"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface RenameFileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: FileItem | null;
  onFileRenamed: (file: FileItem) => void;
}

export function RenameFileDialog({
  isOpen,
  onOpenChange,
  item,
  onFileRenamed,
}: RenameFileDialogProps) {
  const [newName, setNewName] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  // Update newName when item changes
  useEffect(() => {
    if (item) {
      setNewName(item.name);
    }
  }, [item]);

  const renameItem = async () => {
    if (!item || !newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setProcessingAction(true);
      console.log("[DEBUG] Renaming item:", {
        id: item.id,
        name: newName.trim(),
        type: item.type,
        parentId: item.parentId,
        path: item.path,
        projectId: item.projectId,
      });

      const response = await fetch(`/api/files/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: item.id,
          name: newName.trim(),
          type: item.type,
          parentId: item.parentId,
          path: item.path,
          projectId: item.projectId,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[DEBUG] Error response:", errorText);
        let errorMessage = "Failed to rename item";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // Text wasn't JSON
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      console.log("[DEBUG] Rename raw response:", responseText);

      if (!responseText.trim()) {
        console.error("[DEBUG] Empty response from server");
        toast.error("Server returned an empty response");
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText) as FileActionResponse;
        console.log("[DEBUG] Rename parsed response:", data);
      } catch (parseError) {
        console.error("[DEBUG] Failed to parse rename response:", parseError);
        toast.error("Server returned invalid JSON");
        return;
      }

      if (data.success && data.file) {
        console.log(
          "[DEBUG] Update successful, updating file in state:",
          data.file
        );
        onFileRenamed(data.file);
        onOpenChange(false);
        setNewName("");
        toast.success("Item renamed");
      } else {
        console.error("[DEBUG] Missing file data in rename response:", data);
        toast.error(
          "Item might have been renamed but response format was incorrect"
        );
      }
    } catch (error) {
      console.error("[DEBUG] Error renaming item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to rename item"
      );
    } finally {
      setProcessingAction(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {item?.type}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="newName">New name</Label>
            <Input
              id="newName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  renameItem();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={renameItem} disabled={processingAction}>
              {processingAction && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Rename
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
