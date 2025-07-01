import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type HeaderGroup,
  type Header,
  type Row,
  type Cell,
  type Table as ReactTableInstance,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import {
  HardDriveIcon,
  FolderIcon,
  FileIcon,
  UploadIcon,
  DownloadIcon,
  TrashIcon,
  RefreshCwIcon,
  ArrowUpIcon,
  SearchIcon,
  FolderPlusIcon,
  HomeIcon,
  ImageIcon,
  FileTextIcon,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type {
  R2Bucket as CloudflareR2Bucket,
  R2Object as CloudflareR2Object,
} from "@/lib/r2-api";

// Define the expected R2Object structure from our worker API
// This should align with what the R2 binding's `list()` method returns for objects
interface R2Object {
  key: string;
  size: number;
  etag: string;
  uploaded: string; // R2 often provides 'uploaded' (ISO8601 string) or 'last_modified'
  last_modified?: string; // Keep for compatibility if present
  httpEtag?: string;
  customMetadata?: Record<string, string>;
  version?: string; // R2 provides version for versioned buckets
  checksums?: { md5?: string }; // Example, adjust based on actual R2 list() output
}

// Bucket definition as expected from /api/r2/config
interface R2Bucket {
  name: string;
  // Add other properties if your /api/r2/config endpoint provides them, e.g., creation_date (though worker bindings don't inherently know this)
}

// Response from /api/r2/buckets/:bucketName/objects
interface R2ListObjectsResponse {
  objects: R2Object[];
  delimited_prefixes: string[]; // These are the "folders"
  truncated: boolean;
  cursor?: string;
  // Potentially add result_info for pagination if your worker provides it, like the old API did
  result_info?: {
    total_count?: number; // Total items in the current prefix/delimiter view if available
    // count?: number; // Items in the current page
    // cursor?: string; // Next cursor
  };
}

// Data type for table rows (combines folders and files)
type StorageItem = {
  id: string;
  name: string;
  type: "folder" | "file";
  size?: number;
  lastModified?: string;
  lastModifiedTimestamp?: number;
  fullKey: string;
};

export default function R2Storage() {
  const [buckets, setBuckets] = useState<R2Bucket[]>([]);
  const [objects, setObjects] = useState<R2Object[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [currentBucket, setCurrentBucket] = useState<string>("");
  const [currentPath, setCurrentPath] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);

  // Pagination specific state
  const [pageCursors, setPageCursors] = useState<Array<string | undefined>>([
    undefined,
  ]);
  const [isLastPage, setIsLastPage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Forward declaration for table instance to use in pageCount, will be properly initialized later
  // This is a common pattern to break circular dependencies if table methods are needed in options.
  // However, for pageCount, we can directly use pagination state.
  // let table: ReactTableInstance<StorageItem>;

  const loadBuckets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/r2/config");
      if (!response.ok) {
        let errorMessage = `Failed to load buckets: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (
            errorData &&
            typeof errorData === "object" &&
            "message" in errorData &&
            typeof errorData.message === "string"
          ) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          /* Ignore if parsing errorData fails, use default message */
        }
        throw new Error(errorMessage);
      }
      const data: { buckets: R2Bucket[] } = await response.json();
      console.log(
        "Data from /api/r2/config (R2Storage.tsx):",
        JSON.stringify(data, null, 2)
      );

      if (data && Array.isArray(data.buckets)) {
        const processedBuckets = data.buckets.filter(
          (b: any) => b && typeof b.name === "string"
        );
        setBuckets(processedBuckets);
        if (processedBuckets.length > 0 && !currentBucket) {
          // setCurrentBucket(processedBuckets[0].name); // Optionally auto-select first bucket
        }
      } else {
        console.warn(
          "[R2Storage.tsx] /api/r2/config did not return a 'buckets' array. Data:",
          data
        );
        setBuckets([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load buckets";
      setError(errorMessage);
      console.error("[R2Storage.tsx] Error in loadBuckets:", errorMessage, err);
      setBuckets([]);
    } finally {
      setLoading(false);
    }
  }, [currentBucket]);

  const loadObjects = useCallback(
    async (targetPageIndex: number, limit: number) => {
      if (!currentBucket) return;

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (currentPath) params.append("prefix", currentPath);
        params.append("delimiter", "/");
        params.append("limit", limit.toString());

        const cursorForTargetPage = pageCursors[targetPageIndex];
        if (cursorForTargetPage) {
          params.append("cursor", cursorForTargetPage);
        }

        const response = await fetch(
          `/api/r2/buckets/${currentBucket}/objects?${params.toString()}`
        );
        if (!response.ok) {
          let errorMessage = `Failed to load objects: ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (
              errorData &&
              typeof errorData === "object" &&
              "message" in errorData &&
              typeof errorData.message === "string"
            ) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            /* Ignore */
          }
          throw new Error(errorMessage);
        }
        const data: R2ListObjectsResponse = await response.json();
        console.log(
          `[R2Storage.tsx] Data from /api/r2/buckets/${currentBucket}/objects (prefix: '${currentPath}', pageIndex: ${targetPageIndex}, cursor: ${cursorForTargetPage || "none"}):`,
          JSON.stringify(data, null, 2)
        );

        const newObjectList: R2Object[] = data.objects || [];
        const newFolderList: string[] = data.delimited_prefixes || [];

        setFolders(newFolderList);
        setObjects(newObjectList);

        if (data.truncated && data.cursor) {
          setPageCursors((prev) => {
            const nextCursors = [...prev];
            while (nextCursors.length <= targetPageIndex + 1) {
              nextCursors.push(undefined);
            }
            nextCursors[targetPageIndex + 1] = data.cursor;
            return nextCursors;
          });
          setIsLastPage(false);
        } else {
          setIsLastPage(true);
          setPageCursors((prev) => prev.slice(0, targetPageIndex + 1));
        }

        if (data.result_info?.total_count !== undefined) {
          setTotalItems(data.result_info.total_count);
        } else if (data.truncated) {
          setTotalItems(
            newObjectList.length +
              newFolderList.length +
              (data.cursor ? limit : 0)
          );
        } else {
          setTotalItems(newObjectList.length + newFolderList.length);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load objects");
        console.error("Error loading objects:", err);
        setObjects([]);
        setFolders([]);
        setTotalItems(0);
        setIsLastPage(true);
      } finally {
        setLoading(false);
      }
    },
    [currentBucket, currentPath]
  );

  // Load buckets on component mount
  useEffect(() => {
    loadBuckets();
  }, [loadBuckets]);

  // Load objects when bucket, path, or pagination changes
  useEffect(() => {
    if (currentBucket) {
      loadObjects(pagination.pageIndex, pagination.pageSize);
    }
  }, [
    currentBucket,
    currentPath,
    pagination.pageIndex,
    pagination.pageSize,
    loadObjects,
  ]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !currentBucket) return;

    setLoading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const objectKey = currentPath
          ? `${currentPath.endsWith("/") ? currentPath : currentPath + "/"}${file.name}`
          : file.name;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("objectKey", objectKey);

        const response = await fetch(
          `/api/r2/buckets/${currentBucket}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          let errorMessage = `Failed to upload ${file.name}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (
              errorData &&
              typeof errorData === "object" &&
              "message" in errorData &&
              typeof errorData.message === "string"
            ) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            /* Ignore */
          }
          throw new Error(errorMessage);
        }
        return response.json();
      });

      await Promise.all(uploadPromises);
      await loadObjects(pagination.pageIndex, pagination.pageSize);
      console.log(`Successfully uploaded ${files.length} files`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteObject = useCallback(
    async (objectKey: string) => {
      if (!currentBucket) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/r2/buckets/${currentBucket}/delete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ objectKeys: [objectKey] }),
          }
        );

        if (!response.ok) {
          let errorMessage = `Failed to delete object: ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (
              errorData &&
              typeof errorData === "object" &&
              "message" in errorData &&
              typeof errorData.message === "string"
            ) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            /* Ignore */
          }
          throw new Error(errorMessage);
        }

        await loadObjects(pagination.pageIndex, pagination.pageSize);
        console.log(`Successfully deleted ${objectKey}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
        console.error("Delete error:", err);
      } finally {
        setLoading(false);
      }
    },
    [currentBucket, loadObjects, pagination.pageIndex, pagination.pageSize]
  );

  const handleDownloadObject = useCallback(
    async (objectKey: string) => {
      if (!currentBucket) return;
      setError(null);

      try {
        const encodedObjectKey = objectKey
          .split("/")
          .map(encodeURIComponent)
          .join("/");

        const response = await fetch(
          `/api/r2/buckets/${currentBucket}/objects/${encodedObjectKey}`
        );

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(
            errorData || `Failed to download object: ${response.statusText}`
          );
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = objectKey.split("/").pop() || objectKey;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log(`Successfully downloaded ${objectKey}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Download failed");
        console.error("Download error:", err);
      }
    },
    [currentBucket, setError]
  );

  const handleCreateFolder = async () => {
    const folderNameInput = prompt("Enter folder name:");
    if (!folderNameInput || !currentBucket) return;

    const folderName = folderNameInput.trim();
    if (!folderName || folderName.includes("/")) {
      setError("Invalid folder name. It cannot be empty or contain slashes.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const base =
        currentPath && !currentPath.endsWith("/")
          ? `${currentPath}/`
          : currentPath;
      const folderPath = `${base}${folderName}/`;

      const response = await fetch(`/api/r2/buckets/${currentBucket}/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: folderPath }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to create folder: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (
            errorData &&
            typeof errorData === "object" &&
            "message" in errorData &&
            typeof errorData.message === "string"
          ) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          /* Ignore */
        }
        throw new Error(errorMessage);
      }

      await loadObjects(pagination.pageIndex, pagination.pageSize);
      console.log(`Successfully created folder ${folderPath}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Folder creation failed");
      console.error("Folder creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = useCallback((bytes: number | undefined): string => {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return "0 Bytes";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes || 0) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const formatDate = useCallback((dateString: string | undefined): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }, []);

  const getFileIcon = useCallback((filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase();

    if (
      ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(
        extension || ""
      )
    ) {
      return <ImageIcon className="h-5 w-5 text-green-500 flex-shrink-0" />;
    }

    if (["txt", "md", "json", "xml", "csv", "log"].includes(extension || "")) {
      return <FileTextIcon className="h-5 w-5 text-gray-600 flex-shrink-0" />;
    }

    return <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />;
  }, []);

  const filteredObjects = useMemo(
    () =>
      objects.filter((obj) =>
        obj.key.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [objects, searchQuery]
  );

  const filteredFolders = useMemo(
    () =>
      folders.filter((folder) => {
        const folderDisplayName = folder
          .replace(currentPath, "")
          .replace("/", "");
        return folderDisplayName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }),
    [folders, searchQuery, currentPath]
  );

  const tableData: StorageItem[] = useMemo(() => {
    const folderItems: StorageItem[] = filteredFolders.map((folderKey) => ({
      id: `folder-${folderKey}`,
      name: folderKey.replace(currentPath, "").replace(/\/?$/, ""),
      type: "folder" as const,
      fullKey: folderKey,
    }));

    const fileItems: StorageItem[] = filteredObjects.map((obj) => {
      const modifiedDate = obj.uploaded || obj.last_modified;
      const timestamp = modifiedDate ? new Date(modifiedDate).getTime() : 0;
      return {
        id: `file-${obj.key}`,
        name: obj.key.replace(currentPath, ""),
        type: "file" as const,
        size: obj.size,
        lastModified: modifiedDate,
        lastModifiedTimestamp: timestamp,
        fullKey: obj.key,
      };
    });

    return [...folderItems, ...fileItems];
  }, [filteredFolders, filteredObjects, currentPath]);

  const columns: ColumnDef<StorageItem>[] = useMemo(
    () => [
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const item = row.original;
          return item.type === "folder" ? (
            <FolderIcon className="h-5 w-5 text-blue-500" />
          ) : (
            getFileIcon(item.name)
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 h-auto font-medium"
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              className={`font-medium ${
                item.type === "folder"
                  ? "cursor-pointer hover:text-blue-600"
                  : ""
              }`}
              onClick={() => {
                if (item.type === "folder") {
                  setCurrentPath(item.fullKey);
                }
              }}
            >
              {item.name}
            </div>
          );
        },
      },
      {
        accessorKey: "size",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 h-auto font-medium"
            >
              Size
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const item = row.original;
          return item.type === "folder" ? (
            <Badge variant="outline">Folder</Badge>
          ) : (
            <span>{formatBytes(item.size)}</span>
          );
        },
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.original;
          const b = rowB.original;
          if (a.type === "folder" && b.type === "file") return -1;
          if (a.type === "file" && b.type === "folder") return 1;
          if (a.type === "folder" && b.type === "folder") return 0;

          const sizeA = a.size || 0;
          const sizeB = b.size || 0;
          return sizeA - sizeB;
        },
      },
      {
        accessorKey: "lastModified",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 h-auto font-medium"
            >
              Modified
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const item = row.original;
          return item.type === "folder" ? (
            <span>-</span>
          ) : (
            <span>{formatDate(item.lastModified)}</span>
          );
        },
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.original;
          const b = rowB.original;
          if (a.type === "folder" && b.type === "file") return -1;
          if (a.type === "file" && b.type === "folder") return 1;
          if (a.type === "folder" && b.type === "folder") return 0;

          const dateA = a.lastModifiedTimestamp || 0;
          const dateB = b.lastModifiedTimestamp || 0;
          return dateA - dateB;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;

          if (item.type === "folder") {
            return <span>-</span>;
          }

          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownloadObject(item.fullKey)}
                disabled={loading}
              >
                <DownloadIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800"
                onClick={() => handleDeleteObject(item.fullKey)}
                disabled={loading}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [
      getFileIcon,
      formatBytes,
      formatDate,
      handleDeleteObject,
      handleDownloadObject,
      loading,
      currentPath,
      setCurrentPath,
    ]
  );

  const table: ReactTableInstance<StorageItem> = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      pagination,
    },
    manualPagination: true,
    onPaginationChange: setPagination,
    manualSorting: true,
    onSortingChange: (updater) => {
      setSorting(updater);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      setPageCursors([undefined]);
      setIsLastPage(false);
    },
    pageCount: isLastPage ? pagination.pageIndex + 1 : -1,
  });

  const breadcrumbs = useMemo(
    () => currentPath.split("/").filter(Boolean),
    [currentPath]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          R2 Storage Explorer
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your Cloudflare R2 storage buckets
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="w-full" style={{ minHeight: 600 }}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <HardDriveIcon className="h-5 w-5" />
                R2 Storage Browser
              </CardTitle>
              <CardDescription>
                Browse and manage your Cloudflare R2 buckets and objects
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  currentBucket
                    ? loadObjects(pagination.pageIndex, pagination.pageSize)
                    : loadBuckets()
                }
                disabled={loading}
              >
                <RefreshCwIcon
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>

          {/* Bucket Selection and Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label htmlFor="bucket-select" className="whitespace-nowrap">
                Bucket:
              </Label>
              <Select
                value={currentBucket}
                onValueChange={(value) => {
                  setCurrentBucket(value);
                  setCurrentPath("");
                  setPagination({
                    pageIndex: 0,
                    pageSize: pagination.pageSize,
                  });
                  setObjects([]);
                  setFolders([]);
                  setTotalItems(0);
                  setPageCursors([undefined]);
                  setIsLastPage(false);
                }}
                disabled={loading || buckets.length === 0}
              >
                <SelectTrigger id="bucket-select" className="w-full sm:w-48">
                  <SelectValue placeholder="Select bucket" />
                </SelectTrigger>
                <SelectContent>
                  {buckets.length === 0 && !loading && (
                    <div className="p-2 text-sm text-gray-500">
                      No buckets found.
                    </div>
                  )}
                  {buckets.map((bucket) => (
                    <SelectItem key={bucket.name} value={bucket.name}>
                      {bucket.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex-1 w-full sm:max-w-md">
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
                  onClick={() => setCurrentPath("")}
                  disabled={!currentPath}
                >
                  <HomeIcon className="h-4 w-4" />
                </Button>

                {currentPath && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const pathParts = currentPath.split("/").filter(Boolean);
                      pathParts.pop();
                      const newPath =
                        pathParts.length > 0 ? pathParts.join("/") + "/" : "";
                      setCurrentPath(newPath);
                      setPagination({
                        pageIndex: 0,
                        pageSize: pagination.pageSize,
                      });
                      setPageCursors([undefined]);
                      setIsLastPage(false);
                    }}
                    disabled={!currentPath || loading}
                  >
                    <ArrowUpIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Breadcrumbs */}
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>{currentBucket || "No bucket selected"}</span>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    <span>/</span>
                    <button
                      className="hover:text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                      onClick={() => {
                        const path =
                          breadcrumbs.slice(0, index + 1).join("/") + "/";
                        setCurrentPath(path);
                        setPagination({
                          pageIndex: 0,
                          pageSize: pagination.pageSize,
                        });
                        setPageCursors([undefined]);
                        setIsLastPage(false);
                      }}
                      disabled={loading}
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
                disabled={!currentBucket || loading}
              >
                <UploadIcon className="h-4 w-4 mr-2" />
                Upload Files
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!currentBucket || loading}
                onClick={handleCreateFolder}
              >
                <FolderPlusIcon className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </div>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-auto" style={{ minHeight: 400 }}>
            {!currentBucket ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <HardDriveIcon className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {buckets.length > 0
                    ? "Select a Bucket"
                    : "No Buckets Available"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {buckets.length > 0
                    ? "Choose a bucket from the dropdown to browse its contents"
                    : "No R2 buckets seem to be configured or accessible."}
                </p>
                {loading && (
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin mt-4" />
                )}
                {buckets.length === 0 && !loading && !error && (
                  <p className="text-sm text-gray-500">
                    Attempted to load buckets. If you have buckets configured,
                    check worker logs.
                  </p>
                )}
                {buckets.length === 0 && !loading && error && (
                  <p className="text-sm text-red-500">Error loading buckets.</p>
                )}
              </div>
            ) : loading && objects.length === 0 && folders.length === 0 ? (
              <div className="flex items-center justify-center h-full py-12">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            ) : tableData.length === 0 && currentBucket ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <HardDriveIcon className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? "No results found" : "This folder is empty"}
                </h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? `No files or folders match "${searchQuery}"`
                    : "Upload files or create folders to get started"}
                </p>
              </div>
            ) : (
              <div className="p-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      {table
                        .getHeaderGroups()
                        .map((headerGroup: HeaderGroup<StorageItem>) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map(
                              (header: Header<StorageItem, unknown>) => {
                                return (
                                  <TableHead key={header.id}>
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                        )}
                                  </TableHead>
                                );
                              }
                            )}
                          </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table
                          .getRowModel()
                          .rows.map((row: Row<StorageItem>) => (
                            <TableRow
                              key={row.id}
                              data-state={row.getIsSelected() && "selected"}
                            >
                              {row
                                .getVisibleCells()
                                .map((cell: Cell<StorageItem, unknown>) => (
                                  <TableCell key={cell.id}>
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </TableCell>
                                ))}
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            No results.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    {totalItems} total items
                  </div>
                  <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">Rows per page</p>
                      <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                          setPagination((prev) => ({
                            ...prev,
                            pageSize: Number(value),
                            pageIndex: 0,
                          }));
                        }}
                        disabled={loading}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue
                            placeholder={table.getState().pagination.pageSize}
                          />
                        </SelectTrigger>
                        <SelectContent side="top">
                          {[10, 20, 30, 40, 50].map((pageSize) => (
                            <SelectItem key={pageSize} value={`${pageSize}`}>
                              {pageSize}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                      Page {table.getState().pagination.pageIndex + 1} of{" "}
                      {table.getPageCount() === -1
                        ? `${table.getState().pagination.pageIndex + 1 + (table.getCanNextPage() ? "+" : "")}`
                        : table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage() || loading}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage() || loading}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </Card>

      {/* Setup Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Setup Status</CardTitle>
          <CardDescription>
            Current connection status to Cloudflare R2
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Connection Status</h4>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    error
                      ? "bg-red-500"
                      : buckets.length > 0 && currentBucket
                        ? "bg-green-500"
                        : loading && buckets.length === 0
                          ? "bg-yellow-500"
                          : buckets.length === 0 && !error
                            ? "bg-gray-400"
                            : "bg-yellow-500"
                  }`}
                ></div>
                <span className="text-sm">
                  {error
                    ? "Connection failed"
                    : loading && buckets.length === 0 && !currentBucket
                      ? "Attempting to load buckets..."
                      : buckets.length > 0 && !currentBucket
                        ? `Found ${buckets.length} bucket${buckets.length === 1 ? "" : "s"}. Please select one.`
                        : buckets.length > 0 && currentBucket
                          ? `Connected to ${currentBucket} (${buckets.length} bucket${buckets.length === 1 ? "" : "s"} total)`
                          : "No buckets found or unable to connect."}
                </span>
              </div>
            </div>

            {buckets.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Available Buckets</h4>
                <div className="space-y-1">
                  {buckets.map((bucket) => (
                    <div
                      key={bucket.name}
                      className="text-sm text-gray-600 flex justify-between"
                    >
                      <span>{bucket.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
