"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface DeleteResponse {
  success: boolean;
  message?: string;
}

interface DeleteFileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: FileItem | null;
  onFileDeleted: (fileId: string) => void;
}

export function DeleteFileDialog({
  isOpen,
  onOpenChange,
  item,
  onFileDeleted,
}: DeleteFileDialogProps) {
  const [processingAction, setProcessingAction] = useState(false);

  const confirmDelete = async () => {
    if (!item) {
      return;
    }

    const { id, type } = item;

    try {
      setProcessingAction(true);
      console.log("[DEBUG] Deleting item:", { id, type });

      const response = await fetch(`/api/files/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      console.log("[DEBUG] Delete response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[DEBUG] Delete error response:", errorText);
        let errorMessage = "Failed to delete item";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // Text wasn't JSON
        }
        throw new Error(errorMessage);
      }

      // Read and parse the response
      const responseText = await response.text();
      console.log("[DEBUG] Delete raw response:", responseText);

      if (!responseText.trim()) {
        console.error("[DEBUG] Empty response from server");
        toast.error("Server returned an empty response");
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText) as DeleteResponse;
        console.log("[DEBUG] Delete parsed response:", data);
      } catch (parseError) {
        console.error("[DEBUG] Failed to parse delete response:", parseError);
        toast.error("Server returned invalid JSON");
        return;
      }

      if (data.success) {
        console.log("[DEBUG] Delete successful, removing file from state:", id);
        onFileDeleted(id);
        onOpenChange(false);
        toast.success(`${type === "folder" ? "Folder" : "File"} deleted`);
      } else {
        console.error("[DEBUG] Unsuccessful delete operation:", data);
        toast.error(data.message || "Failed to delete item");
      }
    } catch (error) {
      console.error("[DEBUG] Error deleting item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete item"
      );
    } finally {
      setProcessingAction(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {item?.type}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete "{item?.name}"?
            {item?.type === "folder" &&
              " This will also delete all files and folders inside it."}{" "}
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={processingAction}
            >
              {processingAction && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
