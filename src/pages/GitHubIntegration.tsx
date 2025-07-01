import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import Tabs from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  GitBranch,
  GitPullRequest,
  Github,
  Settings,
  Plus,
  ExternalLink,
  Code,
  FileText,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { useGitHub } from "../providers/GitHubProvider";
import { CodeEditor } from "../components/file-explorer/code-editor";
import { toast } from "sonner";

interface GitHubIntegration {
  id: string;
  githubUserId: string;
  githubUsername: string;
  scope: string;
  createdAt: string;
  updatedAt: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

// API Response Types
interface IntegrationStatusResponse {
  connected: boolean;
  integration?: GitHubIntegration;
}

interface OAuthResponse {
  authUrl: string;
}

interface RepositoriesResponse {
  repositories: GitHubRepo[];
}

interface BranchesResponse {
  branches: GitHubBranch[];
}

interface PullRequestResponse {
  pullRequest: {
    id: number;
    number: number;
    html_url: string;
    title: string;
  };
}

interface DirectoryContentsResponse {
  contents: Array<{
    name: string;
    path: string;
    sha: string;
    size: number;
    type: "file" | "dir";
    download_url: string | null;
  }>;
}

interface FileContentResponse {
  content: string;
  sha: string;
  path: string;
}

const githubIntegrationTabs = [
  "Repositories",
  "Branches",
  "Pull Requests",
  "Files",
];

export default function GitHubIntegration() {
  const { setSelectedRepo, setSelectedBranch } = useGitHub();
  const [integration, setIntegration] = useState<GitHubIntegration | null>(
    null
  );
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [selectedRepoState, setSelectedRepoState] = useState<GitHubRepo | null>(
    null
  );
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedBranchState, setSelectedBranchState] = useState<string>("");

  // Branch creation form
  const [newBranchName, setNewBranchName] = useState("");
  const [sourceBranch, setSourceBranch] = useState("");

  // Pull request form
  const [prTitle, setPrTitle] = useState("");
  const [prBody, setPrBody] = useState("");
  const [prHead, setPrHead] = useState("");
  const [prBase, setPrBase] = useState("");

  const [operationLoading, setOperationLoading] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // File browser state
  const [currentPath, setCurrentPath] = useState<string>("");
  const [directoryContents, setDirectoryContents] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<{
    path: string;
    content: string;
  } | null>(null);
  const [fileViewLoading, setFileViewLoading] = useState(false);

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
  };

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  const checkIntegrationStatus = async () => {
    try {
      const response = await fetch("/api/github/integration", {
        credentials: "include",
      });

      const data: IntegrationStatusResponse = await response.json();
      setConnected(data.connected);
      setIntegration(data.integration || null);

      if (data.connected) {
        await loadRepositories();
      }
    } catch (error) {
      console.error("Error checking GitHub integration:", error);
    } finally {
      setLoading(false);
    }
  };

  const startGitHubAuth = async () => {
    try {
      const response = await fetch("/api/github/oauth/github", {
        credentials: "include",
      });

      const data: OAuthResponse = await response.json();
      if (data.authUrl) {
        // Open GitHub OAuth in a popup
        const popup = window.open(
          data.authUrl,
          "github-oauth",
          "width=600,height=700,scrollbars=yes,resizable=yes"
        );

        // Listen for popup to close
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Check if auth was successful
            setTimeout(() => {
              checkIntegrationStatus();
            }, 1000);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error starting GitHub auth:", error);
    }
  };

  const disconnectGitHub = async () => {
    try {
      setOperationLoading(true);
      await fetch("/api/github/integration", {
        method: "DELETE",
        credentials: "include",
      });

      setConnected(false);
      setIntegration(null);
      setRepositories([]);
      setSelectedRepoState(null);
      setBranches([]);
    } catch (error) {
      console.error("Error disconnecting GitHub:", error);
    } finally {
      setOperationLoading(false);
    }
  };

  const loadRepositories = async () => {
    try {
      const response = await fetch("/api/github/repositories", {
        credentials: "include",
      });

      const data: RepositoriesResponse = await response.json();
      if (data.repositories) {
        setRepositories(data.repositories);
      }
    } catch (error) {
      console.error("Error loading repositories:", error);
    }
  };

  const loadBranches = async (repo: GitHubRepo) => {
    try {
      setOperationLoading(true);
      const [owner, repoName] = repo.full_name.split("/");

      const response = await fetch(
        `/api/github/repositories/${owner}/${repoName}/branches`,
        {
          credentials: "include",
        }
      );

      const data: BranchesResponse = await response.json();
      if (data.branches) {
        setBranches(data.branches);
        setSelectedRepoState(repo);
        setSelectedBranchState(data.branches[0]?.name || "main");

        // Also update the global GitHub context
        setSelectedRepo(repo);
        setSelectedBranch(data.branches[0]?.name || "main");
      }
    } catch (error) {
      console.error("Error loading branches:", error);
    } finally {
      setOperationLoading(false);
    }
  };

  const createBranch = async () => {
    if (!selectedRepoState || !newBranchName || !sourceBranch) return;

    try {
      setOperationLoading(true);
      const [owner, repoName] = selectedRepoState.full_name.split("/");

      const response = await fetch(
        `/api/github/repositories/${owner}/${repoName}/branches`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            branchName: newBranchName,
            fromBranch: sourceBranch,
          }),
        }
      );

      if (response.ok) {
        await loadBranches(selectedRepoState);
        setNewBranchName("");
        setSourceBranch("");
      }
    } catch (error) {
      console.error("Error creating branch:", error);
    } finally {
      setOperationLoading(false);
    }
  };

  const createPullRequest = async () => {
    if (!selectedRepoState || !prTitle || !prHead || !prBase) return;

    try {
      setOperationLoading(true);
      const [owner, repoName] = selectedRepoState.full_name.split("/");

      const response = await fetch(
        `/api/github/repositories/${owner}/${repoName}/pulls`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: prTitle,
            head: prHead,
            base: prBase,
            body: prBody,
          }),
        }
      );

      if (response.ok) {
        const data: PullRequestResponse = await response.json();
        console.log("Pull request created:", data.pullRequest);
        // Reset form
        setPrTitle("");
        setPrBody("");
        setPrHead("");
        setPrBase("");
      }
    } catch (error) {
      console.error("Error creating pull request:", error);
    } finally {
      setOperationLoading(false);
    }
  };

  const loadDirectoryContents = async (path: string = "") => {
    if (!selectedRepoState) return;

    try {
      setFileViewLoading(true);
      // Clear existing contents when navigating
      setDirectoryContents([]);

      const [owner, repoName] = selectedRepoState.full_name.split("/");

      console.log("Loading directory contents for path:", path);

      const response = await fetch(
        `/api/github/repositories/${owner}/${repoName}/tree/${path}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to load directory:", response.status, errorText);
        throw new Error(`Failed to load directory: ${response.status}`);
      }

      const data: DirectoryContentsResponse = await response.json();
      console.log("Directory contents from API:", data.contents);

      if (data.contents) {
        setDirectoryContents(data.contents);
        setCurrentPath(path);
      } else {
        console.warn("No contents in API response");
        setDirectoryContents([]);
        setCurrentPath(path);
      }
    } catch (error) {
      console.error("Error loading directory contents:", error);
      toast.error(
        `Failed to load directory: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      // Reset to root on error
      if (path !== "") {
        setCurrentPath("");
        loadDirectoryContents("");
      }
    } finally {
      setFileViewLoading(false);
    }
  };

  const loadFileContent = async (filePath: string) => {
    if (!selectedRepoState) return;

    try {
      setFileViewLoading(true);
      const [owner, repoName] = selectedRepoState.full_name.split("/");

      const response = await fetch(
        `/api/github/repositories/${owner}/${repoName}/contents/${filePath}`,
        {
          credentials: "include",
        }
      );

      const data: FileContentResponse = await response.json();
      if (data.content) {
        setSelectedFile({ path: filePath, content: data.content });
      }
    } catch (error) {
      console.error("Error loading file content:", error);
    } finally {
      setFileViewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GitHub Integration</h1>
          <p className="text-muted-foreground">
            Connect your GitHub account to enable automated code operations
          </p>
        </div>
      </div>

      {!connected ? (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Connect GitHub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your GitHub account to access repositories, create
              branches, and manage pull requests.
            </p>
            <Button onClick={startGitHubAuth} className="w-full">
              Connect GitHub Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  GitHub Account
                </div>
                <Badge variant="default">Connected</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">@{integration?.githubUsername}</p>
                  <p className="text-sm text-muted-foreground">
                    Connected on{" "}
                    {new Date(
                      integration?.createdAt || ""
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Scope: {integration?.scope}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={disconnectGitHub}
                  disabled={operationLoading}
                >
                  {operationLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs
            tabs={githubIntegrationTabs}
            onTabChange={handleTabChange}
            initialActiveIndex={activeTabIndex}
          />

          <div className="space-y-4">
            {activeTabIndex === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Repositories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {repositories.map((repo) => (
                      <div
                        key={repo.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => loadBranches(repo)}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{repo.name}</h3>
                            {repo.private && (
                              <Badge variant="secondary">Private</Badge>
                            )}
                            {repo.language && (
                              <Badge variant="outline">{repo.language}</Badge>
                            )}
                          </div>
                          {repo.description && (
                            <p className="text-sm text-muted-foreground">
                              {repo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>⭐ {repo.stargazers_count}</span>
                            <span>🍴 {repo.forks_count}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(repo.html_url, "_blank");
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTabIndex === 1 && (
              <>
                {selectedRepoState ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          Branches - {selectedRepoState.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {branches.map((branch) => (
                            <div
                              key={branch.name}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4" />
                                <span className="font-medium">
                                  {branch.name}
                                </span>
                                {branch.protected && (
                                  <Badge variant="secondary">Protected</Badge>
                                )}
                              </div>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {branch.commit.sha.substring(0, 7)}
                              </code>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Create New Branch</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="branch-name">Branch Name</Label>
                            <Input
                              id="branch-name"
                              placeholder="feature/new-feature"
                              value={newBranchName}
                              onChange={(e) => setNewBranchName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="source-branch">Source Branch</Label>
                            <Select
                              value={sourceBranch}
                              onValueChange={setSourceBranch}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select source branch" />
                              </SelectTrigger>
                              <SelectContent>
                                {branches.map((branch) => (
                                  <SelectItem
                                    key={branch.name}
                                    value={branch.name}
                                  >
                                    {branch.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button
                          onClick={createBranch}
                          disabled={
                            !newBranchName || !sourceBranch || operationLoading
                          }
                        >
                          {operationLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          Create Branch
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">
                        Select a repository to view branches
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {activeTabIndex === 2 && (
              <>
                {selectedRepoState ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Create Pull Request</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="pr-title">Title</Label>
                        <Input
                          id="pr-title"
                          placeholder="Pull request title"
                          value={prTitle}
                          onChange={(e) => setPrTitle(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pr-head">Head Branch</Label>
                          <Select value={prHead} onValueChange={setPrHead}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select head branch" />
                            </SelectTrigger>
                            <SelectContent>
                              {branches.map((branch) => (
                                <SelectItem
                                  key={branch.name}
                                  value={branch.name}
                                >
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pr-base">Base Branch</Label>
                          <Select value={prBase} onValueChange={setPrBase}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select base branch" />
                            </SelectTrigger>
                            <SelectContent>
                              {branches.map((branch) => (
                                <SelectItem
                                  key={branch.name}
                                  value={branch.name}
                                >
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pr-body">Description (optional)</Label>
                        <Textarea
                          id="pr-body"
                          placeholder="Describe your changes..."
                          value={prBody}
                          onChange={(e) => setPrBody(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <Button
                        onClick={createPullRequest}
                        disabled={
                          !prTitle || !prHead || !prBase || operationLoading
                        }
                      >
                        {operationLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <GitPullRequest className="h-4 w-4 mr-2" />
                        )}
                        Create Pull Request
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">
                        Select a repository to create pull requests
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {activeTabIndex === 3 && (
              <>
                {selectedRepoState ? (
                  <div className="grid grid-cols-12 gap-4 h-[600px]">
                    {/* File Browser - Left Side */}
                    <Card className="col-span-4 overflow-hidden">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>Files - {selectedRepoState.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7"
                            onClick={() => loadDirectoryContents("")}
                            disabled={fileViewLoading}
                          >
                            <Code className="h-3 w-3 mr-1" />
                            Browse
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-2 overflow-auto h-[calc(100%-60px)]">
                        {currentPath && (
                          <div className="mb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start h-7 text-xs"
                              onClick={() => {
                                const parentPath = currentPath
                                  .split("/")
                                  .slice(0, -1)
                                  .join("/");
                                loadDirectoryContents(parentPath);
                              }}
                            >
                              ← Back
                            </Button>
                            <span className="text-xs text-muted-foreground ml-2">
                              /{currentPath}
                            </span>
                          </div>
                        )}

                        {fileViewLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin" />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {directoryContents.map((item) => (
                              <Button
                                key={item.path}
                                variant={
                                  selectedFile?.path === item.path
                                    ? "secondary"
                                    : "ghost"
                                }
                                size="sm"
                                className="w-full justify-start h-8 px-2 text-xs"
                                onClick={() => {
                                  console.log(
                                    "Clicked item:",
                                    item.name,
                                    "type:",
                                    item.type
                                  );
                                  if (item.type === "dir") {
                                    loadDirectoryContents(item.path);
                                  } else {
                                    loadFileContent(item.path);
                                  }
                                }}
                              >
                                {item.type === "dir" ? (
                                  <FolderOpen className="h-3 w-3 mr-1.5 text-blue-500" />
                                ) : (
                                  <Code className="h-3 w-3 mr-1.5" />
                                )}
                                <span className="truncate">{item.name}</span>
                                {item.type === "file" && (
                                  <span className="ml-auto text-muted-foreground">
                                    {(item.size / 1024).toFixed(1)}KB
                                  </span>
                                )}
                              </Button>
                            ))}
                            {directoryContents.length === 0 && (
                              <p className="text-center text-xs text-muted-foreground py-4">
                                {currentPath
                                  ? "Empty directory"
                                  : "Click 'Browse' to start"}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Code Editor - Right Side */}
                    <Card className="col-span-8 overflow-hidden">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">
                          {selectedFile
                            ? selectedFile.path
                            : "Select a file to view"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 h-[calc(100%-60px)] overflow-scroll">
                        <CodeEditor
                          selectedGitHubFile={
                            selectedFile
                              ? {
                                  path: selectedFile.path,
                                  name:
                                    selectedFile.path.split("/").pop() ||
                                    selectedFile.path,
                                  content: selectedFile.content,
                                }
                              : null
                          }
                          isGitHubMode={true}
                          selectedRepo={selectedRepoState}
                        />
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">
                        Select a repository to browse files
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
