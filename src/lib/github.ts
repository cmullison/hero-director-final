import { Octokit } from "@octokit/rest";
import type { 
  GitHubUser, 
  GitHubRepository, 
  GitHubBranch, 
  GitHubPullRequest 
} from "./types";

export class GitHubService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  /**
   * Get the authenticated user's information
   */
  async getUser(): Promise<GitHubUser> {
    try {
      const { data } = await this.octokit.rest.users.getAuthenticated();
      return {
        id: data.id,
        login: data.login,
        name: data.name,
        email: data.email,
        avatar_url: data.avatar_url,
        bio: data.bio,
        public_repos: data.public_repos,
        followers: data.followers,
        following: data.following,
      };
    } catch (error) {
      console.error("Error fetching GitHub user:", error);
      throw new Error("Failed to fetch GitHub user information");
    }
  }

  /**
   * Get user's repositories
   */
  async getRepositories(page = 1, perPage = 30): Promise<GitHubRepository[]> {
    try {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        page,
        per_page: perPage,
        sort: 'updated',
        direction: 'desc'
      });

      return data.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        ssh_url: repo.ssh_url,
        default_branch: repo.default_branch,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        open_issues_count: repo.open_issues_count,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
        owner: {
          login: repo.owner.login,
          id: repo.owner.id,
          avatar_url: repo.owner.avatar_url,
        },
      }));
    } catch (error) {
      console.error("Error fetching repositories:", error);
      throw new Error("Failed to fetch repositories");
    }
  }

  /**
   * Get branches for a specific repository
   */
  async getBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    try {
      const { data } = await this.octokit.rest.repos.listBranches({
        owner,
        repo,
      });

      return data.map(branch => ({
        name: branch.name,
        commit: {
          sha: branch.commit.sha,
          url: branch.commit.url,
        },
        protected: branch.protected,
      }));
    } catch (error) {
      console.error("Error fetching branches:", error);
      throw new Error("Failed to fetch branches");
    }
  }

  /**
   * Create a new branch
   */
  async createBranch(owner: string, repo: string, branchName: string, fromSha: string): Promise<void> {
    try {
      await this.octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: fromSha,
      });
    } catch (error) {
      console.error("Error creating branch:", error);
      throw new Error("Failed to create branch");
    }
  }

  /**
   * Get file content from repository
   */
  async getFileContent(owner: string, repo: string, path: string, ref?: string): Promise<{ content: string; sha: string }> {
    try {
      console.log(`[GitHubService] Getting file content for: owner=${owner}, repo=${repo}, path="${path}", ref=${ref}`);
      
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      console.log(`[GitHubService] API response:`, {
        isArray: Array.isArray(data),
        type: Array.isArray(data) ? 'array' : (data as any).type,
        name: !Array.isArray(data) ? (data as any).name : undefined,
        path: !Array.isArray(data) ? (data as any).path : undefined,
      });

      if (Array.isArray(data) || data.type !== 'file') {
        console.error(`[GitHubService] Expected file but got: ${Array.isArray(data) ? 'directory listing' : data.type}`);
        throw new Error("Path does not point to a file");
      }

      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      console.log(`[GitHubService] Successfully decoded file content, length: ${content.length}`);
      
      return {
        content,
        sha: data.sha,
      };
    } catch (error) {
      console.error("Error fetching file content:", error);
      throw new Error("Failed to fetch file content");
    }
  }

  /**
   * Get directory contents from repository
   */
  async getDirectoryContents(
    owner: string, 
    repo: string, 
    path: string = '', 
    ref?: string
  ): Promise<Array<{
    name: string;
    path: string;
    sha: string;
    size: number;
    type: 'file' | 'dir';
    download_url: string | null;
  }>> {
    try {
      console.log(`[GitHubService] Getting contents for: owner=${owner}, repo=${repo}, path="${path}", ref=${ref}`);
      
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      console.log(`[GitHubService] API response type: ${Array.isArray(data) ? 'array' : 'single item'}`);
      
      if (!Array.isArray(data)) {
        throw new Error("Path does not point to a directory");
      }

      console.log(`[GitHubService] Found ${data.length} items in directory`);
      
      return data.map(item => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
        size: item.size,
        type: item.type as 'file' | 'dir',
        download_url: item.download_url,
      }));
    } catch (error) {
      console.error("Error fetching directory contents:", error);
      throw new Error("Failed to fetch directory contents");
    }
  }

  /**
   * Create or update a file in the repository
   */
  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch?: string,
    sha?: string
  ): Promise<void> {
    try {
      const encodedContent = Buffer.from(content, 'utf-8').toString('base64');
      
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: encodedContent,
        branch,
        sha,
      });
    } catch (error) {
      console.error("Error creating/updating file:", error);
      throw new Error("Failed to create or update file");
    }
  }

  /**
   * Create a pull request
   */
  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body?: string
  ): Promise<GitHubPullRequest> {
    try {
      const { data } = await this.octokit.rest.pulls.create({
        owner,
        repo,
        title,
        head,
        base,
        body,
      });

      return {
        id: data.id,
        number: data.number,
        state: data.state as 'open' | 'closed' | 'merged',
        title: data.title,
        body: data.body,
        head: {
          ref: data.head.ref,
          sha: data.head.sha,
          repo: {
            name: data.head.repo?.name || '',
            full_name: data.head.repo?.full_name || '',
          },
        },
        base: {
          ref: data.base.ref,
          sha: data.base.sha,
          repo: {
            name: data.base.repo.name,
            full_name: data.base.repo.full_name,
          },
        },
        html_url: data.html_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
        merged_at: data.merged_at,
        user: {
          login: data.user?.login || '',
          avatar_url: data.user?.avatar_url || '',
        },
      };
    } catch (error) {
      console.error("Error creating pull request:", error);
      throw new Error("Failed to create pull request");
    }
  }

  /**
   * Get pull requests for a repository
   */
  async getPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubPullRequest[]> {
    try {
      const { data } = await this.octokit.rest.pulls.list({
        owner,
        repo,
        state,
      });

      return data.map(pr => ({
        id: pr.id,
        number: pr.number,
        state: pr.state as 'open' | 'closed' | 'merged',
        title: pr.title,
        body: pr.body,
        head: {
          ref: pr.head.ref,
          sha: pr.head.sha,
          repo: {
            name: pr.head.repo?.name || '',
            full_name: pr.head.repo?.full_name || '',
          },
        },
        base: {
          ref: pr.base.ref,
          sha: pr.base.sha,
          repo: {
            name: pr.base.repo.name,
            full_name: pr.base.repo.full_name,
          },
        },
        html_url: pr.html_url,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        merged_at: pr.merged_at,
        user: {
          login: pr.user?.login || '',
          avatar_url: pr.user?.avatar_url || '',
        },
      }));
    } catch (error) {
      console.error("Error fetching pull requests:", error);
      throw new Error("Failed to fetch pull requests");
    }
  }
} 