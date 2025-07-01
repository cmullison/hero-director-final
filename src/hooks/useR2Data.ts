import { useState, useEffect, useCallback } from 'react';
import { type R2Bucket, type R2Object, type R2ListResponse } from '../lib/r2-api';
import { useToast } from './use-toast';

interface UseR2DataOptions {
  autoLoad?: boolean;
  bucketName?: string;
  prefix?: string;
}

interface R2DataState {
  buckets: R2Bucket[];
  currentBucket: string | null;
  objects: R2Object[];
  folders: string[];
  currentPath: string;
  loading: boolean;
  error: string | null;
  uploadProgress: Record<string, number>;
}

interface UploadTask {
  file: File;
  path: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export function useR2Data(options: UseR2DataOptions = {}) {
  const { autoLoad = true, bucketName, prefix = '' } = options;
  const { toast } = useToast();

  const [state, setState] = useState<R2DataState>({
    buckets: [],
    currentBucket: bucketName || null,
    objects: [],
    folders: [],
    currentPath: prefix,
    loading: false,
    error: null,
    uploadProgress: {},
  });

  const [uploads, setUploads] = useState<Record<string, UploadTask>>({});

  // Load buckets using server-side API
  const loadBuckets = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/cloudflare/r2/buckets');
      if (!response.ok) {
        throw new Error(`Failed to load buckets: ${response.statusText}`);
      }
      const data = await response.json() as { buckets: R2Bucket[] };
      const buckets = data.buckets || [];
      
      setState(prev => ({ 
        ...prev, 
        buckets, 
        loading: false,
        currentBucket: prev.currentBucket || (buckets[0]?.name || null)
      }));

      // Auto-load first bucket if specified
      if (!state.currentBucket && buckets.length > 0) {
        await loadObjects(buckets[0].name);
      }
    } catch (error) {
      console.error('Failed to load buckets:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load buckets',
        loading: false
      }));
    }
  }, [state.currentBucket]);

  // Load objects in a bucket using server-side API
  const loadObjects = useCallback(async (bucket?: string, path?: string) => {
    const targetBucket = bucket || state.currentBucket;
    const targetPath = path !== undefined ? path : state.currentPath;

    if (!targetBucket) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (targetPath) params.append('prefix', targetPath);
      params.append('delimiter', '/');

      const response = await fetch(
        `/api/cloudflare/r2/buckets/${targetBucket}/objects?${params}`
      );
      if (!response.ok) {
        throw new Error(`Failed to load objects: ${response.statusText}`);
      }
      const data = await response.json() as {
        objects: R2Object[];
        common_prefixes: string[];
      };

      // Separate files and folders
      const objects = data.objects || [];
      const folders = data.common_prefixes || [];

      setState(prev => ({
        ...prev,
        currentBucket: targetBucket,
        currentPath: targetPath,
        objects,
        folders,
        loading: false
      }));
    } catch (error) {
      console.error('Failed to load objects:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load objects',
        loading: false
      }));
    }
  }, [state.currentBucket, state.currentPath]);

  // Initialize and auto-load if specified
  useEffect(() => {
    if (autoLoad) {
      loadBuckets();
    }
  }, [autoLoad, loadBuckets]);

  // Navigate to folder
  const navigateToFolder = useCallback(async (folderPath: string) => {
    await loadObjects(state.currentBucket || undefined, folderPath);
  }, [loadObjects, state.currentBucket]);

  // Go up one directory level
  const navigateUp = useCallback(async () => {
    const currentPath = state.currentPath;
    if (!currentPath) return;

    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop(); // Remove last folder
    const newPath = pathParts.join('/');
    
    await loadObjects(state.currentBucket || undefined, newPath);
  }, [loadObjects, state.currentBucket, state.currentPath]);

  // Upload file using server-side API
  const uploadFile = useCallback(async (
    file: File, 
    targetPath?: string,
    metadata?: Record<string, string>
  ) => {
    if (!state.currentBucket) {
      toast({
        title: 'Error',
        description: 'No bucket selected',
        variant: 'destructive'
      });
      return false;
    }

    const path = targetPath || `${state.currentPath}${state.currentPath ? '/' : ''}${file.name}`;
    const uploadId = `${state.currentBucket}/${path}`;

    // Add to upload tasks
    setUploads(prev => ({
      ...prev,
      [uploadId]: {
        file,
        path,
        progress: 0,
        status: 'uploading'
      }
    }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', path);
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await fetch(
        `/api/cloudflare/r2/buckets/${state.currentBucket}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      setUploads(prev => ({
        ...prev,
        [uploadId]: {
          ...prev[uploadId],
          status: 'completed',
          progress: 100
        }
      }));

      toast({
        title: 'Upload Successful',
        description: `${file.name} uploaded successfully`
      });

      // Refresh objects list
      await loadObjects();
      return true;
    } catch (error) {
      console.error('Upload failed:', error);
      
      setUploads(prev => ({
        ...prev,
        [uploadId]: {
          ...prev[uploadId],
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        }
      }));

      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Upload failed',
        variant: 'destructive'
      });

      return false;
    }
  }, [state.currentBucket, state.currentPath, toast, loadObjects]);

  // Upload multiple files
  const uploadFiles = useCallback(async (
    files: File[],
    targetPath?: string,
    metadata?: Record<string, string>
  ) => {
    const results = await Promise.allSettled(
      files.map(file => uploadFile(file, targetPath, metadata))
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - successful;

    if (failed > 0) {
      toast({
        title: 'Upload Complete with Errors',
        description: `${successful} files uploaded successfully, ${failed} failed`,
        variant: failed > successful ? 'destructive' : 'default'
      });
    } else {
      toast({
        title: 'All Uploads Successful',
        description: `${successful} files uploaded successfully`
      });
    }

    return successful;
  }, [uploadFile, toast]);

  // Delete object using server-side API
  const deleteObject = useCallback(async (objectKey: string) => {
    if (!state.currentBucket) return false;

    try {
      const response = await fetch(
        `/api/cloudflare/r2/buckets/${state.currentBucket}/objects/${encodeURIComponent(objectKey)}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }
      
      toast({
        title: 'File Deleted',
        description: `${objectKey.split('/').pop()} deleted successfully`
      });

      // Refresh objects list
      await loadObjects();
      return true;
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Delete failed',
        variant: 'destructive'
      });
      return false;
    }
  }, [state.currentBucket, toast, loadObjects]);

  // Delete multiple objects
  const deleteObjects = useCallback(async (objectKeys: string[]) => {
    if (!state.currentBucket) return 0;

    try {
      const deletePromises = objectKeys.map(key => 
        fetch(`/api/cloudflare/r2/buckets/${state.currentBucket}/objects/${encodeURIComponent(key)}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(deletePromises);
      
      toast({
        title: 'Files Deleted',
        description: `${objectKeys.length} files deleted successfully`
      });

      // Refresh objects list
      await loadObjects();
      return objectKeys.length;
    } catch (error) {
      console.error('Bulk delete failed:', error);
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Bulk delete failed',
        variant: 'destructive'
      });
      return 0;
    }
  }, [state.currentBucket, toast, loadObjects]);

  // Download object using server-side API
  const downloadObject = useCallback(async (objectKey: string, filename?: string) => {
    if (!state.currentBucket) return;

    try {
      const response = await fetch(
        `/api/cloudflare/r2/buckets/${state.currentBucket}/objects/${encodeURIComponent(objectKey)}/download`
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || objectKey.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download Started',
        description: `${objectKey.split('/').pop()} download started`
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Download failed',
        variant: 'destructive'
      });
    }
  }, [state.currentBucket, toast]);

  // Create folder using server-side API
  const createFolder = useCallback(async (folderName: string) => {
    if (!state.currentBucket) return false;

    const folderPath = `${state.currentPath}${state.currentPath ? '/' : ''}${folderName}/`;

    try {
      const response = await fetch(
        `/api/cloudflare/r2/buckets/${state.currentBucket}/folders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: folderPath }),
        }
      );

      if (!response.ok) {
        throw new Error(`Folder creation failed: ${response.statusText}`);
      }
      
      toast({
        title: 'Folder Created',
        description: `${folderName} created successfully`
      });

      // Refresh objects list
      await loadObjects();
      return true;
    } catch (error) {
      console.error('Folder creation failed:', error);
      toast({
        title: 'Folder Creation Failed',
        description: error instanceof Error ? error.message : 'Folder creation failed',
        variant: 'destructive'
      });
      return false;
    }
  }, [state.currentBucket, state.currentPath, toast, loadObjects]);

  // Get file content using server-side API
  const getFileContent = useCallback(async (objectKey: string): Promise<string | null> => {
    if (!state.currentBucket) return null;

    try {
      const response = await fetch(
        `/api/cloudflare/r2/buckets/${state.currentBucket}/objects/${encodeURIComponent(objectKey)}/content`
      );

      if (!response.ok) {
        throw new Error(`Failed to get file content: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error('Failed to get file content:', error);
      toast({
        title: 'Failed to Load File',
        description: error instanceof Error ? error.message : 'Failed to load file content',
        variant: 'destructive'
      });
      return null;
    }
  }, [state.currentBucket, toast]);

  // Clear upload tasks
  const clearCompletedUploads = useCallback(() => {
    setUploads(prev => {
      const filtered = Object.entries(prev).reduce((acc, [key, task]) => {
        if (task.status === 'uploading' || task.status === 'pending') {
          acc[key] = task;
        }
        return acc;
      }, {} as Record<string, UploadTask>);
      return filtered;
    });
  }, []);

  return {
    // State
    ...state,
    uploads,
    
    // Actions
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
    getFileContent,
    clearCompletedUploads,
    
    // Computed
    isConnected: true, // Always connected since we use server-side APIs
    hasUploads: Object.keys(uploads).length > 0,
    activeUploads: Object.values(uploads).filter(u => u.status === 'uploading').length,
    
    // Path helpers
    breadcrumbs: state.currentPath.split('/').filter(Boolean),
    canGoUp: !!state.currentPath,
  };
} 