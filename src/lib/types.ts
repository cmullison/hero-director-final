import type { Agent } from "agents";
import type { AgentNamespace } from "agents";

// Define Env interface for typechecking
export interface Env {
  OPENAI_API_KEY?: string;
  GATEWAY_BASE_URL?: string;
  DB: D1Database;
  AI?: any;
  Chat?: DurableObjectNamespace;
  Main?: DurableObjectNamespace;
  SITE_URL?: string;
  ASSETS_URL?: string;
  ANTHROPIC_API_KEY?: string;
  IMAGE_BUCKET?: R2Bucket;
  HOST?: string;
  AI_GATEWAY_TOKEN: string;
  AI_GATEWAY_ACCOUNT_ID: string;
  AI_GATEWAY_ID: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GITHUB_REDIRECT_URI?: string;
  Sequential: AgentNamespace<Agent<Env>>;
  Routing: AgentNamespace<Agent<Env>>;
  Parallel: AgentNamespace<Agent<Env>>;
  Orchestrator: AgentNamespace<Agent<Env>>;
  Evaluator: AgentNamespace<Agent<Env>>;
}

// Define your schema
export interface UserTable {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean | null;
  image: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  password: string | null;
}

export interface SessionTable {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// Define the structure for the user_conversations table
export interface UserConversationsTable {
  id: string; // Primary key, e.g., UUID
  createdAt: string; // ISO date string for when the record was created
  userId: string; // Foreign key to UserTable.id
  userName: string | null; // Denormalized user name for easier display
  agentName: string; // Name of the AI agent used
  sessionId: string | null; // Foreign key to SessionTable.id, if applicable
  sessionIpAddress: string | null; // IP address from the session
  sessionUserAgent: string | null; // User agent from the session
  conversationStart: string; // ISO date string for when the first message was sent
  lastSaved: string; // ISO date string for when the conversation was last saved/updated
  messageCount: number; // Total number of messages in the conversation
  messages_json: string; // JSON string containing all messages
}

export interface ProfileTable {
  id: string; // uuid
  createdAt: string; // ISO timestamp
  userId: string;
  name: string | null;
}

export interface CodeBlocksTable {
  id: string; // uuid
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  title: string;
  code: string;
  language: string;
}

export interface FilesTable {
  id: string;
  userId: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTable {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  collaboratorsJson: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedSessionsTable {
  id: string;
  user_id: string;
  session_name: string;
  agent_type: string;
  created_at: string;
  last_accessed: string;
  mcp_servers: string; // JSON string
  metadata: string; // JSON string
}

export interface GitHubIntegrationTable {
  id: string;
  userId: string;
  githubUserId: string;
  githubUsername: string;
  accessToken: string;
  refreshToken: string | null;
  scope: string;
  tokenType: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface GitHubRepositoryTable {
  id: string;
  userId: string;
  githubRepoId: string;
  name: string;
  fullName: string;
  description: string | null;
  isPrivate: boolean;
  defaultBranch: string;
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
  language: string | null;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string;
}

export interface ChatsTable {
  id: string;
  userId: string;
  title: string | null;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessagesTable {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolInvocations: string | null; // JSON string
  createdAt: string;
}



export interface Database {
  user: UserTable;
  session: SessionTable;
  user_conversations: UserConversationsTable;
  profile: ProfileTable;
  code_blocks: CodeBlocksTable;
  files: FilesTable;
  project: ProjectTable;
  saved_sessions: SavedSessionsTable;
  github_integration: GitHubIntegrationTable;
  github_repository: GitHubRepositoryTable;
  chats: ChatsTable;
  messages: MessagesTable;
  // Add other tables here as needed by your application
}

// GitHub API types
export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string | null;
  updated_at: string | null;
  pushed_at: string | null;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
  };
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  state: 'open' | 'closed' | 'merged';
  title: string;
  body: string | null;
  head: {
    ref: string;
    sha: string;
    repo: {
      name: string;
      full_name: string;
    };
  };
  base: {
    ref: string;
    sha: string;
    repo: {
      name: string;
      full_name: string;
    };
  };
  html_url: string;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
}
