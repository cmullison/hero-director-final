import React from 'react';
import {
  FileIcon,
  FileTextIcon,
  ImageIcon,
  FileVideoIcon,
  FileAudioIcon,
  ArchiveIcon,
  CodeIcon,
  FileSpreadsheetIcon,
  PresentationIcon,
  HardDriveIcon,
} from 'lucide-react';

// Format bytes to human readable format
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format date to human readable format
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Get file extension from filename
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

// Check if file is an image
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'];
  return imageExtensions.includes(getFileExtension(filename));
}

// Check if file is a video
export function isVideoFile(filename: string): boolean {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'];
  return videoExtensions.includes(getFileExtension(filename));
}

// Check if file is audio
export function isAudioFile(filename: string): boolean {
  const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'];
  return audioExtensions.includes(getFileExtension(filename));
}

// Check if file is a text file
export function isTextFile(filename: string): boolean {
  const textExtensions = ['txt', 'md', 'json', 'xml', 'csv', 'log', 'yaml', 'yml'];
  return textExtensions.includes(getFileExtension(filename));
}

// Check if file is code
export function isCodeFile(filename: string): boolean {
  const codeExtensions = [
    'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'sass', 'less',
    'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift',
    'kt', 'scala', 'sh', 'bash', 'sql', 'r', 'matlab', 'pl', 'perl'
  ];
  return codeExtensions.includes(getFileExtension(filename));
}

// Check if file is a document
export function isDocumentFile(filename: string): boolean {
  const docExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'];
  return docExtensions.includes(getFileExtension(filename));
}

// Check if file is an archive
export function isArchiveFile(filename: string): boolean {
  const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'];
  return archiveExtensions.includes(getFileExtension(filename));
}

// Get appropriate icon for file type
export function getFileIcon(
  filename: string, 
  contentType?: string, 
  className: string = 'h-5 w-5 text-gray-500 flex-shrink-0'
): React.ReactElement {
  const extension = getFileExtension(filename);

  if (isImageFile(filename)) {
    return React.createElement(ImageIcon, { className: `${className.replace('text-gray-500', 'text-green-500')}` });
  }

  if (isVideoFile(filename)) {
    return React.createElement(FileVideoIcon, { className: `${className.replace('text-gray-500', 'text-red-500')}` });
  }

  if (isAudioFile(filename)) {
    return React.createElement(FileAudioIcon, { className: `${className.replace('text-gray-500', 'text-purple-500')}` });
  }

  if (isCodeFile(filename)) {
    return React.createElement(CodeIcon, { className: `${className.replace('text-gray-500', 'text-blue-500')}` });
  }

  if (isTextFile(filename)) {
    return React.createElement(FileTextIcon, { className: `${className.replace('text-gray-500', 'text-gray-600')}` });
  }

  if (isArchiveFile(filename)) {
    return React.createElement(ArchiveIcon, { className: `${className.replace('text-gray-500', 'text-orange-500')}` });
  }

  // Specific document types
  if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return React.createElement(FileSpreadsheetIcon, { className: `${className.replace('text-gray-500', 'text-green-600')}` });
  }

  if (['ppt', 'pptx'].includes(extension)) {
    return React.createElement(PresentationIcon, { className: `${className.replace('text-gray-500', 'text-orange-600')}` });
  }

  // Default file icon
  return React.createElement(FileIcon, { className });
}

// Get MIME type from file extension
export function getMimeType(filename: string): string {
  const extension = getFileExtension(filename);
  
  const mimeTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'ico': 'image/x-icon',
    
    // Videos
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
    'mkv': 'video/x-matroska',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'flac': 'audio/flac',
    'aac': 'audio/aac',
    'ogg': 'audio/ogg',
    'wma': 'audio/x-ms-wma',
    
    // Text
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'text/javascript',
    'json': 'application/json',
    'xml': 'application/xml',
    'csv': 'text/csv',
    'md': 'text/markdown',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    'bz2': 'application/x-bzip2',
  };

  return mimeTypes[extension] || 'application/octet-stream';
}

// Check if file can be previewed in browser
export function canPreviewFile(filename: string): boolean {
  return isImageFile(filename) || isTextFile(filename) || getFileExtension(filename) === 'pdf';
}

// Generate file download name
export function getDownloadFilename(objectKey: string): string {
  const parts = objectKey.split('/');
  return parts[parts.length - 1] || 'download';
}

// Validate file name for upload
export function isValidFileName(filename: string): boolean {
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(filename)) {
    return false;
  }

  // Check for reserved names (Windows)
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
  const nameWithoutExt = filename.split('.')[0];
  if (reservedNames.test(nameWithoutExt)) {
    return false;
  }

  // Check length
  if (filename.length > 255) {
    return false;
  }

  return true;
}

// Sanitize file name for upload
export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/^\.+/, '')
    .substring(0, 255);
}

// Parse object key to get folder structure
export function parsePath(objectKey: string): { folder: string; filename: string } {
  const parts = objectKey.split('/');
  const filename = parts.pop() || '';
  const folder = parts.join('/');
  
  return { folder, filename };
}

// Get relative path from current path
export function getRelativePath(currentPath: string, targetPath: string): string {
  if (targetPath.startsWith(currentPath)) {
    return targetPath.substring(currentPath.length).replace(/^\//, '');
  }
  return targetPath;
}

// Check if path is a folder (ends with /)
export function isFolder(path: string): boolean {
  return path.endsWith('/');
}

// Normalize path (remove extra slashes, etc.)
export function normalizePath(path: string): string {
  return path
    .split('/')
    .filter(Boolean)
    .join('/');
}

// Get parent path
export function getParentPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return parts.join('/');
} 