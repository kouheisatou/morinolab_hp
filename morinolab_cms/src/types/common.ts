export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  localPath: string;
}

export interface GitHubOAuthConfig {
  clientId: string;
  clientSecret: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  clone_url: string;
  html_url: string;
  default_branch: string;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export interface GitHubResponse {
  success: boolean;
  error: string | null;
}

export interface GitHubStatusResponse extends GitHubResponse {
  data: {
    ahead: number;
    behind: number;
    current: string;
    tracking: string;
    files: Array<{
      path: string;
      index: string;
      working_dir: string;
    }>;
  } | null;
}

export interface GitHubInfoResponse extends GitHubResponse {
  data: {
    owner: string;
    repo: string;
    localPath: string;
    isCloned: boolean;
    lastSync?: string;
  } | null;
}

export interface ContentItem {
  id: string;
  title: string;
}

export interface TableData {
  header: string[];
  rows: Record<string, string>[];
}

export interface EncryptedConfig {
  github: {
    clientId: string;
    clientSecret: string;
  };
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  quality?: number;
}

export interface ImageProcessingResult {
  success: boolean;
  data?: number[];
  dimensions?: {
    original: { width: number; height: number };
    new: { width: number; height: number };
  };
  error?: string;
}
