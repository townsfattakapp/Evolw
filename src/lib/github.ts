export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  pushed_at: string;
  created_at: string;
  license: { spdx_id: string; name: string } | null;
  owner: { login: string; avatar_url: string; html_url: string };
  is_private: boolean;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  labels: { name: string; color: string; description: string }[];
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  user: { login: string; avatar_url: string; html_url: string };
  body: string | null;
}

export interface GitHubContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string;
  draft: boolean;
  prerelease: boolean;
  tarball_url: string;
}

export class GitHubAPI {
  private token: string;
  private baseUrl = 'https://api.github.com';
  private owner: string;

  constructor(org: string, token: string) {
    this.owner = org;
    this.token = token;
  }

  private async fetch<T>(path: string, params?: URLSearchParams): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const url = params
        ? `${this.baseUrl}${path}?${params.toString()}`
        : `${this.baseUrl}${path}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`GitHub API ${res.status}: ${errText}`);
      }

      return await res.json();
    } catch (error) {
      console.error('[github] API fetch failed:', error);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  async getOrgRepos(
    state: 'all' | 'public' | 'private' = 'public',
    sort: 'created' | 'updated' | 'pushed' | 'full_name' = 'full_name',
    direction: 'asc' | 'desc' = 'asc'
  ): Promise<GitHubRepo[]> {
    return this.fetch<GitHubRepo[]>(
      `/orgs/${this.owner}/repos`,
      new URLSearchParams({ state, sort, direction })
    );
  }

  async getRepo(fullName: string): Promise<GitHubRepo> {
    return this.fetch<GitHubRepo>(`/repos/${fullName}`);
  }

  async getRepoLanguages(fullName: string): Promise<Record<string, string>> {
    return this.fetch<Record<string, string>>(`/repos/${fullName}/languages`);
  }

  async getRepoIssues(
    fullName: string,
    state: 'open' | 'closed' = 'open',
    labels?: string[],
    perPage = 30
  ): Promise<GitHubIssue[]> {
    const labelParam = labels?.length
      ? labels.map(l => `labels[]=${encodeURIComponent(l)}`).join('&')
      : undefined;

    const params = new URLSearchParams({
      state,
      per_page: perPage.toString(),
      ...(labelParam ? { labels: labelParam } : {}),
    });

    return this.fetch<GitHubIssue[]>(
      `/repos/${fullName}/issues`,
      params
    );
  }

  async getRepoContributors(
    fullName: string,
    perPage = 30
  ): Promise<GitHubContributor[]> {
    return this.fetch<GitHubContributor[]>(
      `/repos/${fullName}/contributors`,
      new URLSearchParams({ per_page: perPage.toString() })
    );
  }

  async getRepoReleases(
    fullName: string,
    perPage = 5
  ): Promise<GitHubRelease[]> {
    return this.fetch<GitHubRelease[]>(
      `/repos/${fullName}/releases`,
      new URLSearchParams({ per_page: perPage.toString() })
    );
  }
}

export function createGitHubAPI(org: string, token: string): GitHubAPI {
  return new GitHubAPI(org, token);
}