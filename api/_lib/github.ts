export function createGitHubAPI(organization: string, token: string) {
  const baseUrl = 'https://api.github.com';
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'User-Agent': 'EVOLW/1.0',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  async function apiFetch(path: string) {
    const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${errorBody}`);
    }
    return response.json();
  }

  return {
    getOrgRepos() {
      return apiFetch(`/orgs/${organization}/repos?type=public&sort=updated&per_page=30`);
    },
    getRepo(fullName: string) {
      return apiFetch(`/repos/${fullName}`);
    },
    getRepoLanguages(fullName: string) {
      return apiFetch(`/repos/${fullName}/languages`);
    },
    getRepoIssues(fullName: string, state = 'open', labels?: string[]) {
      const params = new URLSearchParams({ state, per_page: '30' });
      if (labels?.length) params.set('labels', labels.join(','));
      return apiFetch(`/repos/${fullName}/issues?${params}`);
    },
    getRepoContributors(fullName: string) {
      return apiFetch(`/repos/${fullName}/contributors?per_page=30`);
    },
    getRepoReleases(fullName: string) {
      return apiFetch(`/repos/${fullName}/releases?per_page=20`);
    },
    searchIssues(query: string) {
      const params = new URLSearchParams({
        q: query,
        per_page: '30',
        sort: 'updated',
      });
      return apiFetch(`/search/issues?${params}`);
    },
  };
}
