-- Create google_video_jobs table for Google Video API generation
CREATE TABLE IF NOT EXISTS google_video_jobs (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    prompt TEXT NOT NULL,
    aspectRatio TEXT NOT NULL DEFAULT '16:9',
    personGeneration TEXT NOT NULL DEFAULT 'allow',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    google_operation_name TEXT,
    video_url TEXT,
    error_message TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    completedAt TEXT,
    FOREIGN KEY (userId) REFERENCES user(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_google_video_jobs_userId ON google_video_jobs(userId);
CREATE INDEX IF NOT EXISTS idx_google_video_jobs_status ON google_video_jobs(status);
CREATE INDEX IF NOT EXISTS idx_google_video_jobs_createdAt ON google_video_jobs(createdAt); 