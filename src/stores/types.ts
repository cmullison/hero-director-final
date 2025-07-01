export interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  model: string;
  timestamp: number;
  settings: ImageGenerationSettings;
  projectId?: string;
  saved?: boolean;
}

export interface ImageGenerationSettings {
  quality?: 'standard' | 'hd';
  size?: string;
  style?: string;
  n?: number;
  model?: string;
  aspectRatio?: string;
  outputFormat?: string;
  guidanceScale?: number;
  numInferenceSteps?: number;
  seed?: number;
}

export interface GenerationRequest {
  id: string;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error?: string;
  result?: GeneratedImage[];
  startTime: number;
  endTime?: number;
}

export interface UserPreferences {
  defaultModel: string;
  defaultQuality: 'standard' | 'hd';
  defaultSize: string;
  defaultN: number;
  autoSave: boolean;
  historyLimit: number;
}

export interface ProjectContext {
  activeProjectId: string | null;
  projectName: string | null;
  linkNewContent: boolean;
}