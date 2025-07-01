// R2 Storage API Client for Cloudflare R2 Buckets
import type { CloudflareCredentials } from './cloudflare-api';

export interface R2Object {
  key: string;
  size: number;
  etag: string;
  last_modified: string;
  content_type?: string;
  metadata?: Record<string, string>;
  checksum?: string;
  version?: string;
}

export interface R2Bucket {
  name: string;
  creation_date: string;
  location?: string;
}

export interface R2ListResponse {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
  delimited_prefixes?: string[];
}

export interface R2UploadResponse {
  success: boolean;
  result?: {
    id: string;
    filename: string;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
  };
  errors?: Array<{ code: number; message: string }>;
}

export interface R2DeleteResponse {
  success: boolean;
  errors?: Array<{ code: number; message: string }>;
}

export interface R2PresignedUrl {
  url: string;
  method: string;
  expires: string;
}

class R2API {
  private credentials: CloudflareCredentials;
  private baseUrl = "https://api.cloudflare.com/client/v4";

  constructor(credentials: CloudflareCredentials) {
    this.credentials = credentials;
    console.log("🪣 R2 API initialized");
  }

  private isGlobalAPIKey(): boolean {
    const token = this.credentials.apiToken;
    return !token.includes("-") && !token.includes("_");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    if (!this.credentials.apiToken) {
      throw new Error("API token is required but not provided");
    }

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    } as Record<string, string>;

    if (this.isGlobalAPIKey()) {
      console.log("🔐 Using Global API Key authentication for R2");
      if (!this.credentials.email) {
        throw new Error("Email is required when using Global API Key");
      }
      headers["X-Auth-Email"] = this.credentials.email;
      headers["X-Auth-Key"] = this.credentials.apiToken;
    } else {
      console.log("🔐 Using API Token authentication for R2");
      headers["Authorization"] = `Bearer ${this.credentials.apiToken.trim()}`;
    }

    console.log(`🌐 Making R2 API request to: ${endpoint}`);

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `R2 API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json() as { 
        success?: boolean; 
        result?: T; 
        errors?: Array<{ code: number; message: string }> 
      };

      if (data.success === false) {
        throw new Error(
          `R2 API error: ${data.errors?.[0]?.message || "Unknown error"}`
        );
      }

      return (data.result || data) as T;
    } catch (error) {
      console.error(`💥 R2 API request failed:`, error);
      throw error;
    }
  }

  // List all R2 buckets
  async listBuckets(): Promise<R2Bucket[]> {
    console.log("📋 Fetching R2 buckets...");
    return this.request<R2Bucket[]>(
      `/accounts/${this.credentials.accountId}/r2/buckets`
    );
  }

  // List objects in a bucket
  async listObjects(
    bucketName: string,
    prefix?: string,
    delimiter?: string,
    cursor?: string,
    maxKeys: number = 1000
  ): Promise<R2ListResponse> {
    console.log(`📂 Listing objects in bucket: ${bucketName}, Prefix: '${prefix || ""}', Delimiter: '${delimiter || ""}', Cursor: '${cursor || ""}'`);
    
    const params = new URLSearchParams();
    if (prefix) params.append('prefix', prefix);
    if (delimiter) params.append('delimiter', delimiter);
    if (cursor) params.append('cursor', cursor);
    params.append('max-keys', maxKeys.toString());

    const queryString = params.toString();
    const endpoint = `/accounts/${this.credentials.accountId}/r2/buckets/${bucketName}/objects${queryString ? `?${queryString}` : ''}`;
    
    const rawApiResponse = await this.request<any>(endpoint); // Request as 'any' to inspect

    console.log(`[R2API.listObjects] Raw API response for bucket '${bucketName}', prefix '${prefix}':`, JSON.stringify(rawApiResponse, null, 2));

    if (Array.isArray(rawApiResponse)) {
      console.warn(`[R2API.listObjects] Received direct array from API for bucket '${bucketName}', prefix '${prefix}'. Wrapping into R2ListResponse. Pagination and folder data might be incomplete.`);
      return {
        objects: rawApiResponse as R2Object[],
        truncated: false, // Assumption: if a raw array is returned, it's considered complete for that call.
        cursor: undefined,
        delimited_prefixes: [], // Assumption: raw array means no delimited_prefixes.
      };
    } else if (rawApiResponse && typeof rawApiResponse === 'object') {
      // Check if it conforms to R2ListResponse structure
      const objects = Array.isArray(rawApiResponse.objects) ? rawApiResponse.objects : [];
      const delimited_prefixes = Array.isArray(rawApiResponse.delimited_prefixes) ? rawApiResponse.delimited_prefixes : [];
      const truncated = typeof rawApiResponse.truncated === 'boolean' ? rawApiResponse.truncated : false;
      const responseCursor = typeof rawApiResponse.cursor === 'string' ? rawApiResponse.cursor : undefined;

      if (objects.length > 0 || delimited_prefixes.length > 0 || rawApiResponse.hasOwnProperty('truncated')) {
         console.log(`[R2API.listObjects] Received object-like response for bucket '${bucketName}', prefix '${prefix}'. Normalizing to R2ListResponse.`);
        return {
          objects,
          truncated,
          cursor: responseCursor,
          delimited_prefixes,
        };
      } else {
        console.warn(`[R2API.listObjects] Received an object from API for bucket '${bucketName}', prefix '${prefix}', but it doesn't look like R2ListResponse. Content:`, JSON.stringify(rawApiResponse, null, 2));
         // If it's an empty object {} or something unexpected, return a safe default
        return { objects: [], truncated: false, cursor: undefined, delimited_prefixes: [] };
      }
    } else {
      console.error(`[R2API.listObjects] Unexpected API response type for bucket '${bucketName}', prefix '${prefix}'. Type: ${typeof rawApiResponse}, Value:`, JSON.stringify(rawApiResponse, null, 2));
      return {
        objects: [],
        truncated: false,
        cursor: undefined,
        delimited_prefixes: [],
      };
    }
  }

  // Get object metadata
  async getObjectMetadata(bucketName: string, objectKey: string): Promise<R2Object> {
    console.log(`ℹ️ Getting metadata for: ${bucketName}/${objectKey}`);
    return this.request<R2Object>(
      `/accounts/${this.credentials.accountId}/r2/buckets/${bucketName}/objects/${encodeURIComponent(objectKey)}`
    );
  }

  // Delete object
  async deleteObject(bucketName: string, objectKey: string): Promise<R2DeleteResponse> {
    console.log(`🗑️ Deleting object: ${bucketName}/${objectKey}`);
    return this.request<R2DeleteResponse>(
      `/accounts/${this.credentials.accountId}/r2/buckets/${bucketName}/objects/${encodeURIComponent(objectKey)}`,
      { method: 'DELETE' }
    );
  }

  // Delete multiple objects
  async deleteObjects(bucketName: string, objectKeys: string[]): Promise<R2DeleteResponse[]> {
    console.log(`🗑️ Deleting ${objectKeys.length} objects from: ${bucketName}`);
    const deletePromises = objectKeys.map(key => this.deleteObject(bucketName, key));
    return Promise.all(deletePromises);
  }

  // Create presigned URL for upload
  async createPresignedUploadUrl(
    bucketName: string,
    objectKey: string,
    expiresIn: number = 3600
  ): Promise<R2PresignedUrl> {
    console.log(`🔗 Creating presigned upload URL for: ${bucketName}/${objectKey}`);
    return this.request<R2PresignedUrl>(
      `/accounts/${this.credentials.accountId}/r2/buckets/${bucketName}/objects/${encodeURIComponent(objectKey)}/presigned-url`,
      {
        method: 'POST',
        body: JSON.stringify({
          method: 'PUT',
          expires_in: expiresIn
        })
      }
    );
  }

  // Create presigned URL for download
  async createPresignedDownloadUrl(
    bucketName: string,
    objectKey: string,
    expiresIn: number = 3600
  ): Promise<R2PresignedUrl> {
    console.log(`🔗 Creating presigned download URL for: ${bucketName}/${objectKey}`);
    return this.request<R2PresignedUrl>(
      `/accounts/${this.credentials.accountId}/r2/buckets/${bucketName}/objects/${encodeURIComponent(objectKey)}/presigned-url`,
      {
        method: 'POST',
        body: JSON.stringify({
          method: 'GET',
          expires_in: expiresIn
        })
      }
    );
  }

  // Upload file using presigned URL
  async uploadFile(
    bucketName: string,
    objectKey: string,
    file: File,
    metadata?: Record<string, string>,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    console.log(`⬆️ Uploading file: ${bucketName}/${objectKey}`);
    
    try {
      // Get presigned URL
      const presignedUrl = await this.createPresignedUploadUrl(bucketName, objectKey);
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': file.type || 'application/octet-stream',
      };

      // Add metadata as headers
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          headers[`x-amz-meta-${key}`] = value;
        });
      }

      // Upload using XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log(`✅ File uploaded successfully: ${bucketName}/${objectKey}`);
            resolve(true);
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('PUT', presignedUrl.url);
        
        // Set headers
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        xhr.send(file);
      });
    } catch (error) {
      console.error(`💥 Upload failed:`, error);
      throw error;
    }
  }

  // Download file
  async downloadFile(bucketName: string, objectKey: string): Promise<Blob> {
    console.log(`⬇️ Downloading file: ${bucketName}/${objectKey}`);
    
    try {
      const presignedUrl = await this.createPresignedDownloadUrl(bucketName, objectKey);
      
      const response = await fetch(presignedUrl.url);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      return response.blob();
    } catch (error) {
      console.error(`💥 Download failed:`, error);
      throw error;
    }
  }

  // Get object content as text (for text files)
  async getObjectContent(bucketName: string, objectKey: string): Promise<string> {
    console.log(`📄 Getting content for: ${bucketName}/${objectKey}`);
    const blob = await this.downloadFile(bucketName, objectKey);
    return blob.text();
  }

  // Create folder (by creating a placeholder object)
  async createFolder(bucketName: string, folderPath: string): Promise<boolean> {
    console.log(`📁 Creating folder: ${bucketName}/${folderPath}`);
    
    const folderKey = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    const placeholderKey = `${folderKey}.keep`;
    
    try {
      const presignedUrl = await this.createPresignedUploadUrl(bucketName, placeholderKey);
      
      const response = await fetch(presignedUrl.url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': '0'
        },
        body: new Blob([''], { type: 'application/octet-stream' })
      });

      if (!response.ok) {
        throw new Error(`Folder creation failed: ${response.status} ${response.statusText}`);
      }

      console.log(`✅ Folder created: ${bucketName}/${folderPath}`);
      return true;
    } catch (error) {
      console.error(`💥 Folder creation failed:`, error);
      throw error;
    }
  }
}

export function getR2API(credentials?: CloudflareCredentials): R2API {
  if (!credentials) {
    throw new Error("Cloudflare credentials are required for R2 API");
  }
  return new R2API(credentials);
}

export { R2API }; 