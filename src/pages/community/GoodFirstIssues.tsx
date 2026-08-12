import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Container } from '../../components/ui/container';
import { Section } from '../../components/ui/section';
import { Button } from '../../components/ui/button';
import { SEO } from '../../components/common/seo';
import { communityApi } from '../../lib/community-api';

type Issue = {
  id: number;
  title: string;
  html_url: string;
  repository_url?: string;
  labels?: Array<{ name: string; color?: string }>;
  user?: { login: string };
};

export function GoodFirstIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    communityApi
      .github('issues', { labels: 'good first issue,help wanted' })
      .then((data) => {
        setIssues(data.issues || []);
        if (data.degraded) setMessage(data.message || data.error || 'GitHub unavailable');
      })
      .catch(() => setMessage('Could not load issues'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO
        title="Good First Issues — EVOLW"
        description="Beginner-friendly issues to start contributing to EVOLW."
        path="/community/good-first-issues"
      />
      <Section className="pt-20 pb-16 sm:pt-28 sm:pb-24">
        <Container className="max-w-3xl">
          <Link
            to="/community/open-source"
            className="text-sm font-semibold text-evolw-accent hover:underline"
          >
            ← Open source
          </Link>
          <h1 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-evolw-black dark:text-white">
            Good first issues
          </h1>
          <p className="mt-3 text-evolw-gray-500 dark:text-evolw-gray-400 text-lg mb-8">
            Start here if you want your first meaningful contribution.
          </p>

          {message && (
            <p className="mb-6 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 rounded-xl px-4 py-3">
              {message} — set <code className="font-mono">GITHUB_TOKEN</code> on Vercel for live
              issues.
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-evolw-accent" />
            </div>
          ) : issues.length === 0 ? (
            <div className="rounded-2xl border border-evolw-gray-200 dark:border-white/10 p-8 text-center space-y-4">
              <p className="text-evolw-gray-500">No labeled issues found right now.</p>
              <Button asChild variant="outline">
                <a
                  href="https://github.com/townsfattakapp/Evolw/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Browse GitHub issues
                </a>
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {issues.map((issue) => (
                <li key={issue.id}>
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between gap-4 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-white dark:bg-evolw-slate p-4 hover:border-evolw-accent/40 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-evolw-black dark:text-white">{issue.title}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(issue.labels || []).slice(0, 4).map((l) => (
                          <span
                            key={l.name}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-evolw-gray-100 dark:bg-white/5"
                          >
                            {l.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 shrink-0 text-evolw-gray-400 mt-1" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </>
  );
}
