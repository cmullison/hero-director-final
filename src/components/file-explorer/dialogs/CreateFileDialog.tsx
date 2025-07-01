"use client";

import { useState } from "react";
import { PlusIcon, Loader2, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

interface CreateFileDialogProps {
  projectId?: string | null;
  currentFolder?: string | null;
  availableFolders: FileItem[];
  onFileCreated: (file: FileItem) => void;
  trigger?: React.ReactNode;
}

export function CreateFileDialog({
  projectId,
  currentFolder,
  availableFolders,
  onFileCreated,
  trigger,
}: CreateFileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  const createNewItem = async () => {
    if (!newItemName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    // Warn if creating files without a project
    if (!projectId) {
      const proceed = confirm(
        "You're creating a file without an active project. This file will only be visible when no project is selected. Do you want to continue?"
      );
      if (!proceed) {
        return;
      }
    }

    try {
      setProcessingAction(true);
      console.log("[DEBUG] Creating new item with data:", {
        name: newItemName.trim(),
        type: newItemType,
        parentId: currentFolder,
        projectId: projectId || null,
        path: currentFolder || "root",
      });

      // Create initial content for both files and folders
      const initialCodeBody =
        newItemType === "file"
          ? `// ${newItemName.trim()}\n`
          : "-no code for directory type-";

      // Use selectedFolderId if provided, otherwise use currentFolder
      const parentId =
        selectedFolderId !== null ? selectedFolderId : currentFolder;

      const response = await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: newItemName.trim(),
          type: newItemType,
          parentId: parentId,
          projectId: projectId || null,
          path: parentId || "root",
          codeBody: initialCodeBody,
        }),
      });

      console.log("[DEBUG] Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[DEBUG] Error response text:", errorText);
        let errorMessage = "Failed to create item";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error("[DEBUG] Parsed error data:", errorData);
        } catch (e) {
          console.error("[DEBUG] Error was not valid JSON");
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      console.log("[DEBUG] Raw response text:", responseText);

      if (!responseText.trim()) {
        console.error("[DEBUG] Response is empty");
        toast.error("Server returned an empty response");
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText) as FileActionResponse;
        console.log("[DEBUG] Parsed response data:", data);

        if (data.file) {
          console.log("[DEBUG] File properties:", Object.keys(data.file));
        }
      } catch (parseError) {
        console.error("[DEBUG] Failed to parse response:", parseError);
        toast.error("Server returned invalid JSON");
        return;
      }

      if (data.success && data.file) {
        console.log("[DEBUG] Adding file to state:", data.file);
        onFileCreated(data.file);

        // Reset form and close dialog
        setNewItemName("");
        setSelectedFolderId(null);
        setIsOpen(false);
        toast.success(
          `${newItemType === "folder" ? "Folder" : "File"} created`
        );
      } else {
        console.error("[DEBUG] Missing file data in response:", data);
        toast.error("Created item but response format was incorrect");
      }
    } catch (error) {
      console.error("[DEBUG] Error creating item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create item"
      );
    } finally {
      setProcessingAction(false);
    }
  };

  const defaultTrigger = (
    <Button variant="ghost" size="icon" className="h-6 w-6">
      <PlusIcon className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter name"
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup
              value={newItemType}
              onValueChange={(v: string) => {
                setNewItemType(v as "file" | "folder");
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="file" id="file" />
                <Label htmlFor="file">File</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="folder" id="folder" />
                <Label htmlFor="folder">Folder</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Save to folder</Label>
            <Select
              value={selectedFolderId || "root"}
              onValueChange={(value) =>
                setSelectedFolderId(value === "root" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    Root folder
                  </div>
                </SelectItem>
                {availableFolders.map((folder) => (
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
          <div className="flex justify-end">
            <Button onClick={createNewItem} disabled={processingAction}>
              {processingAction && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
