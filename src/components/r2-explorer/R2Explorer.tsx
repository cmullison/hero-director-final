import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HardDriveIcon,
  FolderIcon,
  FileIcon,
  UploadIcon,
  DownloadIcon,
  TrashIcon,
  PlusIcon,
  RefreshCwIcon,
  ArrowUpIcon,
  SearchIcon,
  MoreVerticalIcon,
  FolderPlusIcon,
  HomeIcon,
  ImageIcon,
  FileTextIcon,
  FileVideoIcon,
  FileAudioIcon,
  ArchiveIcon,
  GridIcon,
  ListIcon,
  SortAscIcon,
  FilterIcon,
} from "lucide-react";
import { useR2Data } from "../../hooks/useR2Data";
import {
  formatBytes,
  formatDate,
  getFileIcon,
  isImageFile,
  isTextFile,
} from "../../lib/r2-utils";

interface R2ExplorerProps {
  bucketName?: string;
  initialPath?: string;
  height?: number;
}

export default function R2Explorer({
  bucketName,
  initialPath = "",
  height = 600,
}: R2ExplorerProps) {
  const {
    buckets,
    currentBucket,
    objects,
    folders,
    currentPath,
    loading,
    error,
    uploads,
    loadBuckets,
    loadObjects,
    navigateToFolder,
    navigateUp,
    uploadFile,
    uploadFiles,
    deleteObject,
    deleteObjects,
    downloadObject,
    createFolder,
    clearCompletedUploads,
    isConnected,
    hasUploads,
    activeUploads,
    breadcrumbs,
    canGoUp,
  } = useR2Data({ bucketName, prefix: initialPath });

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<"name" | "size" | "modified">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    await uploadFiles(fileArray);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Handle item selection
  const toggleItemSelection = (itemKey: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemKey)) {
      newSelection.delete(itemKey);
    } else {
      newSelection.add(itemKey);
    }
    setSelectedItems(newSelection);
  };

  const selectAll = () => {
    const allItems = new Set([
      ...folders.map((f) => f),
      ...objects.map((o) => o.key),
    ]);
    setSelectedItems(allItems);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    const success = await createFolder(newFolderName.trim());
    if (success) {
      setShowCreateFolder(false);
      setNewFolderName("");
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    const itemsToDelete = Array.from(selectedItems).filter((item) =>
      objects.some((obj) => obj.key === item)
    );

    if (itemsToDelete.length > 0) {
      const success = await deleteObjects(itemsToDelete);
      if (success > 0) {
        clearSelection();
      }
    }
  };

  // Filter and sort items
  const filteredAndSortedObjects = objects
    .filter(
      (obj) =>
        searchQuery === "" ||
        obj.key.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.key.localeCompare(b.key);
          break;
        case "size":
          comparison = a.size - b.size;
          break;
        case "modified":
          comparison =
            new Date(a.last_modified).getTime() -
            new Date(b.last_modified).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const filteredFolders = folders.filter(
    (folder) =>
      searchQuery === "" ||
      folder.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isConnected) {
    return (
      <Card className="w-full" style={{ height }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <HardDriveIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              R2 Storage Not Connected
            </h3>
            <p className="text-gray-600 mb-4">
              Configure your Cloudflare API credentials to access R2 storage.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full" style={{ height }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-400 mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Connection Error
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadBuckets} variant="outline">
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full" style={{ height }}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <HardDriveIcon className="h-5 w-5" />
              R2 Storage Explorer
            </CardTitle>
            <CardDescription>
              Browse and manage your Cloudflare R2 buckets
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {hasUploads && (
              <Badge variant="secondary" className="animate-pulse">
                {activeUploads} uploading
              </Badge>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={loadBuckets}
              disabled={loading}
            >
              <RefreshCwIcon
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Bucket Selection */}
        <div className="flex items-center gap-4 pt-4">
          <div className="flex items-center gap-2">
            <Label>Bucket:</Label>
            <Select
              value={currentBucket || ""}
              onValueChange={(value) => loadObjects(value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select bucket" />
              </SelectTrigger>
              <SelectContent>
                {buckets.map((bucket) => (
                  <SelectItem key={bucket.name} value={bucket.name}>
                    {bucket.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            {/* Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadObjects(currentBucket, "")}
                disabled={!currentPath}
              >
                <HomeIcon className="h-4 w-4" />
              </Button>

              {canGoUp && (
                <Button variant="outline" size="sm" onClick={navigateUp}>
                  <ArrowUpIcon className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span>{currentBucket}</span>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <span>/</span>
                  <button
                    className="hover:text-blue-600 hover:underline"
                    onClick={() => {
                      const path = breadcrumbs.slice(0, index + 1).join("/");
                      navigateToFolder(path);
                    }}
                  >
                    {crumb}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={!currentBucket}
            >
              <UploadIcon className="h-4 w-4 mr-2" />
              Upload Files
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateFolder(true)}
              disabled={!currentBucket}
            >
              <FolderPlusIcon className="h-4 w-4 mr-2" />
              New Folder
            </Button>

            {selectedItems.size > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-red-600"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete ({selectedItems.size})
                </Button>

                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </>
            )}

            {/* Sort Controls */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SortAscIcon className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("name")}>
                  Sort by Name {sortBy === "name" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("size")}>
                  Sort by Size {sortBy === "size" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("modified")}>
                  Sort by Modified {sortBy === "modified" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  {sortOrder === "asc" ? "Descending" : "Ascending"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* File List/Grid */}
        <div
          className={`flex-1 overflow-auto ${dragOver ? "bg-blue-50 border-2 border-blue-300 border-dashed" : ""}`}
          style={{ height: height - 280 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Selection Header */}
              {(filteredFolders.length > 0 ||
                filteredAndSortedObjects.length > 0) && (
                <div className="flex items-center gap-2 p-4 bg-gray-50 border-b text-sm">
                  <Checkbox
                    checked={selectedItems.size > 0}
                    onCheckedChange={(checked) => {
                      if (checked) selectAll();
                      else clearSelection();
                    }}
                  />
                  <span className="text-gray-600">
                    {selectedItems.size > 0
                      ? `${selectedItems.size} selected`
                      : `${filteredFolders.length + filteredAndSortedObjects.length} items`}
                  </span>
                </div>
              )}

              {viewMode === "list" ? (
                <div className="divide-y">
                  {/* Folders */}
                  {filteredFolders.map((folder) => (
                    <div
                      key={folder}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigateToFolder(folder)}
                    >
                      <Checkbox
                        checked={selectedItems.has(folder)}
                        onCheckedChange={() => toggleItemSelection(folder)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <FolderIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {folder.split("/").filter(Boolean).pop()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Folder</Badge>
                      </div>
                    </div>
                  ))}

                  {/* Files */}
                  {filteredAndSortedObjects.map((object) => (
                    <div
                      key={object.key}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={selectedItems.has(object.key)}
                        onCheckedChange={() => toggleItemSelection(object.key)}
                      />
                      {getFileIcon(object.key, object.content_type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {object.key.split("/").pop()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatBytes(object.size)} •{" "}
                          {formatDate(object.last_modified)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadObject(object.key)}
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => downloadObject(object.key)}
                            >
                              <DownloadIcon className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            {isImageFile(object.key) && (
                              <DropdownMenuItem>
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteObject(object.key)}
                              className="text-red-600"
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
                  {/* Folders in Grid */}
                  {filteredFolders.map((folder) => (
                    <div
                      key={folder}
                      className="group relative p-4 border rounded-lg hover:shadow-md cursor-pointer bg-white"
                      onClick={() => navigateToFolder(folder)}
                    >
                      <div className="absolute top-2 left-2">
                        <Checkbox
                          checked={selectedItems.has(folder)}
                          onCheckedChange={() => toggleItemSelection(folder)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <FolderIcon className="h-12 w-12 text-blue-500 mb-2" />
                        <p className="text-sm font-medium truncate w-full">
                          {folder.split("/").filter(Boolean).pop()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Files in Grid */}
                  {filteredAndSortedObjects.map((object) => (
                    <div
                      key={object.key}
                      className="group relative p-4 border rounded-lg hover:shadow-md bg-white"
                    >
                      <div className="absolute top-2 left-2">
                        <Checkbox
                          checked={selectedItems.has(object.key)}
                          onCheckedChange={() =>
                            toggleItemSelection(object.key)
                          }
                        />
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => downloadObject(object.key)}
                            >
                              <DownloadIcon className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteObject(object.key)}
                              className="text-red-600"
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        {getFileIcon(
                          object.key,
                          object.content_type,
                          "h-12 w-12 mb-2"
                        )}
                        <p className="text-sm font-medium truncate w-full mb-1">
                          {object.key.split("/").pop()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatBytes(object.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading &&
                filteredFolders.length === 0 &&
                filteredAndSortedObjects.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <HardDriveIcon className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchQuery
                        ? "No matching files found"
                        : "Folder is empty"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery
                        ? "Try adjusting your search terms"
                        : "Upload files or create folders to get started"}
                    </p>
                    {!searchQuery && (
                      <div className="flex gap-2">
                        <Button onClick={() => fileInputRef.current?.click()}>
                          <UploadIcon className="h-4 w-4 mr-2" />
                          Upload Files
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowCreateFolder(true)}
                        >
                          <FolderPlusIcon className="h-4 w-4 mr-2" />
                          New Folder
                        </Button>
                      </div>
                    )}
                  </div>
                )}
            </>
          )}
        </div>

        {/* Drag Over Overlay */}
        {dragOver && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-90 border-2 border-blue-300 border-dashed rounded-lg flex items-center justify-center">
            <div className="text-center">
              <UploadIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <p className="text-xl font-semibold text-blue-700">
                Drop files to upload
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for the new folder in {currentBucket}/{currentPath}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folderName" className="text-right">
                Name
              </Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="col-span-3"
                placeholder="Folder name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateFolder();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateFolder(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
            >
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
