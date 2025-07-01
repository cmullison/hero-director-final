import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

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
  default_branch?: string;
}

interface GitHubContextType {
  selectedRepo: GitHubRepo | null;
  selectedBranch: string | null;
  setSelectedRepo: (repo: GitHubRepo | null) => void;
  setSelectedBranch: (branch: string | null) => void;
  isGitHubMode: boolean;
  setIsGitHubMode: (enabled: boolean) => void;
}

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

export function useGitHub() {
  const context = useContext(GitHubContext);
  if (!context) {
    throw new Error("useGitHub must be used within GitHubProvider");
  }
  return context;
}

interface GitHubProviderProps {
  children: ReactNode;
}

export function GitHubProvider({ children }: GitHubProviderProps) {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [isGitHubMode, setIsGitHubMode] = useState(false);

  return (
    <GitHubContext.Provider
      value={{
        selectedRepo,
        selectedBranch,
        setSelectedRepo,
        setSelectedBranch,
        isGitHubMode,
        setIsGitHubMode,
      }}
    >
      {children}
    </GitHubContext.Provider>
  );
}
