import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, GitBranch, Loader2 } from 'lucide-react';
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
};

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    communityApi
      .projects({ slug })
      .then((data) => {
        if (!data.project) setError('Project not found');
        else setProject(data.project);
      })
      .catch(() => setError('Failed to load project'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Section className="py-24">
        <Container className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-evolw-accent" />
        </Container>
      </Section>
    );
  }

  if (error || !project) {
    return (
      <Section className="py-24">
        <Container className="max-w-xl text-center space-y-4">
          <p className="text-rose-600">{error || 'Not found'}</p>
          <Button asChild variant="outline">
            <Link to="/community/projects">All projects</Link>
          </Button>
        </Container>
      </Section>
    );
  }

  return (
    <>
      <SEO
        title={`${project.name} — EVOLW Community`}
        description={project.tagline || project.description.slice(0, 150)}
        path={`/community/projects/${project.slug}`}
      />
      <Section className="pt-20 pb-16 sm:pt-28 sm:pb-24">
        <Container className="max-w-3xl">
          <Link
            to="/community/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-evolw-accent hover:underline mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> All projects
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-evolw-accent/10 text-evolw-accent">
              {project.status}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-evolw-black dark:text-white mb-3">
            {project.name}
          </h1>
          {project.tagline && (
            <p className="text-xl text-evolw-gray-500 dark:text-evolw-gray-400 mb-8">{project.tagline}</p>
          )}

          <div className="prose dark:prose-invert max-w-none mb-8">
            <p className="text-evolw-gray-600 dark:text-evolw-gray-300 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {(project.technologies || []).map((tech) => (
              <span
                key={tech}
                className="text-sm px-3 py-1.5 rounded-full bg-evolw-gray-100 dark:bg-white/5 text-evolw-gray-700 dark:text-evolw-gray-300"
              >
                {tech}
              </span>
            ))}
          </div>

          {(project.looking_for || []).length > 0 && (
            <div className="mb-8 rounded-2xl border border-evolw-gray-200 dark:border-white/10 p-5">
              <h2 className="font-bold mb-2 text-evolw-black dark:text-white">Looking for</h2>
              <div className="flex flex-wrap gap-2">
                {(project.looking_for || []).map((role) => (
                  <span
                    key={role}
                    className="text-sm px-3 py-1 rounded-full border border-evolw-accent/30 text-evolw-accent"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {project.github_url && (
              <Button asChild variant="accent">
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <GitBranch className="w-4 h-4 mr-2" /> GitHub
                </a>
              </Button>
            )}
            {project.live_url && (
              <Button asChild variant="outline">
                <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" /> Live
                </a>
              </Button>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
