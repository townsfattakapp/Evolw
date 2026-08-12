import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, GitBranch, Loader2, Star } from 'lucide-react';
import { Container } from '../../components/ui/container';
import { Section } from '../../components/ui/section';
import { Button } from '../../components/ui/button';
import { SEO } from '../../components/common/seo';
import { communityApi } from '../../lib/community-api';

type Repo = {
  id: string | number;
  name: string;
  full_name?: string;
  description?: string | null;
  html_url?: string;
  homepage?: string | null;
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  topics?: string[];
  from_community_db?: boolean;
};

export function OpenSource() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    communityApi
      .github('repos')
      .then((data) => {
        setRepos(data.repos || []);
        if (data.degraded) setMessage(data.message || 'Showing curated project list');
      })
      .catch(() => setError('Failed to load open-source projects'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO
        title="Open Source — EVOLW"
        description="Explore EVOLW open-source repositories and community projects."
        path="/community/open-source"
      />
      <Section className="pt-20 pb-16 sm:pt-28 sm:pb-24">
        <Container>
          <div className="max-w-3xl mb-10">
            <Link to="/community" className="text-sm font-semibold text-evolw-accent hover:underline">
              ← Community
            </Link>
            <h1 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-evolw-black dark:text-white">
              Open source
            </h1>
            <p className="mt-3 text-evolw-gray-500 dark:text-evolw-gray-400 text-lg">
              Repositories and curated projects you can star, fork, and contribute to.
            </p>
            {message && (
              <p className="mt-3 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 rounded-xl px-4 py-3">
                {message}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-evolw-accent" />
            </div>
          ) : error ? (
            <div className="text-center space-y-4">
              <p className="text-rose-600">{error}</p>
              <Button asChild variant="outline">
                <a href="https://github.com/townsfattakapp" target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {repos.map((repo) => (
                <article
                  key={repo.id}
                  className="rounded-2xl border border-evolw-gray-200 dark:border-white/10 bg-white dark:bg-evolw-slate p-6"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="font-bold text-lg text-evolw-black dark:text-white">{repo.name}</h2>
                    {typeof repo.stargazers_count === 'number' && (
                      <span className="inline-flex items-center gap-1 text-sm text-evolw-gray-500">
                        <Star className="w-3.5 h-3.5" /> {repo.stargazers_count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400 line-clamp-3 mb-4">
                    {repo.description || 'No description'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {repo.language && (
                      <span className="text-xs px-2 py-1 rounded-md bg-evolw-gray-100 dark:bg-white/5">
                        {repo.language}
                      </span>
                    )}
                    {(repo.topics || []).slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-1 rounded-md bg-evolw-gray-100 dark:bg-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {repo.html_url && (
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-evolw-accent hover:underline"
                      >
                        <GitBranch className="w-4 h-4" /> Code
                      </a>
                    )}
                    {repo.homepage && (
                      <a
                        href={repo.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-evolw-gray-500 hover:text-evolw-accent"
                      >
                        <ExternalLink className="w-4 h-4" /> Live
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-10">
            <Button asChild variant="outline">
              <Link to="/community/good-first-issues">Browse good first issues →</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
