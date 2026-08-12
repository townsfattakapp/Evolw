import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, GitBranch, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Container } from '../../components/ui/container';
import { Section } from '../../components/ui/section';
import { Button } from '../../components/ui/button';
import { SEO } from '../../components/common/seo';
import { communityApi } from '../../lib/community-api';

type Project = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string;
  status: string;
  technologies: string[] | null;
  github_url: string | null;
  live_url: string | null;
  looking_for: string[] | null;
  created_at: string;
};

const STATUS_FILTERS = ['All', 'Live', 'Beta', 'Building', 'Idea'] as const;

export function ProjectListing() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>('All');

  useEffect(() => {
    communityApi
      .projects()
      .then((data) => setProjects(data.projects || []))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (filter === 'All' ? projects : projects.filter((p) => p.status === filter)),
    [projects, filter]
  );

  return (
    <>
      <SEO
        title="Community Projects — EVOLW"
        description="Explore projects built and curated by the EVOLW community."
        path="/community/projects"
      />
      <Section className="pt-20 pb-16 sm:pt-28 sm:pb-24">
        <Container>
          <div className="max-w-3xl mb-10">
            <Link to="/community" className="text-sm font-semibold text-evolw-accent hover:underline">
              ← Community
            </Link>
            <h1 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-evolw-black dark:text-white">
              Project showcase
            </h1>
            <p className="mt-3 text-evolw-gray-500 dark:text-evolw-gray-400 text-lg">
              Products and experiments from EVOLW — find something to use, fork, or contribute to.
            </p>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  filter === s
                    ? 'bg-evolw-accent text-white border-evolw-accent'
                    : 'border-evolw-gray-200 dark:border-white/10 text-evolw-gray-600 dark:text-evolw-gray-300 hover:border-evolw-accent/40'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-evolw-accent" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-8 text-center">
              <p className="text-rose-700 dark:text-rose-300 mb-4">{error}</p>
              <p className="text-sm text-evolw-gray-500 mb-4">
                Locally, start APIs with <code className="font-mono">npm run dev:api</code> in another
                terminal (Vite proxies <code className="font-mono">/api</code> to port 3000).
              </p>
              <Button asChild variant="outline">
                <Link to="/community">Back to Community</Link>
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-evolw-gray-200 dark:border-white/10 p-10 text-center">
              <p className="text-evolw-gray-500">No projects in this filter yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project, i) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex flex-col rounded-2xl border border-evolw-gray-200 dark:border-white/10 bg-white dark:bg-evolw-slate p-6 hover:border-evolw-accent/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-lg font-bold text-evolw-black dark:text-white">
                      <Link to={`/community/projects/${project.slug}`} className="hover:text-evolw-accent">
                        {project.name}
                      </Link>
                    </h2>
                    <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-evolw-accent/10 text-evolw-accent">
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400 line-clamp-3 flex-1">
                    {project.tagline || project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(project.technologies || []).slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-2 py-1 rounded-md bg-evolw-gray-100 dark:bg-white/5 text-evolw-gray-600 dark:text-evolw-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t border-evolw-gray-100 dark:border-white/10 flex items-center gap-3">
                    <Link
                      to={`/community/projects/${project.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-evolw-accent hover:underline"
                    >
                      Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-evolw-gray-400 hover:text-evolw-black dark:hover:text-white"
                        aria-label="GitHub"
                      >
                        <GitBranch className="w-4 h-4" />
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-evolw-gray-400 hover:text-evolw-black dark:hover:text-white"
                        aria-label="Live site"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
