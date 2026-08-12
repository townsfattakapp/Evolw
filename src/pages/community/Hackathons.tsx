import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Loader2, MapPin, Trophy } from 'lucide-react';
import { Container } from '../../components/ui/container';
import { Section } from '../../components/ui/section';
import { Button } from '../../components/ui/button';
import { SEO } from '../../components/common/seo';
import { communityApi } from '../../lib/community-api';

type Hackathon = {
  id: string;
  slug: string;
  title: string;
  description: string;
  organizer: string | null;
  start_date: string;
  end_date: string | null;
  mode: string;
  location: string | null;
  prize_pool: string | null;
  platform: string | null;
  status: string;
  tags: string[] | null;
  external_registration_url: string | null;
};

function formatRange(start: string, end: string | null) {
  const s = new Date(start).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  if (!end) return s;
  const e = new Date(end).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `${s} – ${e}`;
}

export function Hackathons() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    communityApi
      .hackathons()
      .then((data) => setHackathons(data.hackathons || []))
      .catch(() => setError('Failed to load hackathons'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO
        title="Hackathons — EVOLW Community"
        description="Upcoming EVOLW hackathons and build sprints."
        path="/community/hackathons"
      />
      <Section className="pt-20 pb-16 sm:pt-28 sm:pb-24">
        <Container className="max-w-3xl">
          <Link to="/community" className="text-sm font-semibold text-evolw-accent hover:underline">
            ← Community
          </Link>
          <h1 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-evolw-black dark:text-white">
            Hackathons
          </h1>
          <p className="mt-3 text-evolw-gray-500 dark:text-evolw-gray-400 text-lg mb-10">
            Ship with mentors, teammates, and real product problems.
          </p>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-evolw-accent" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 p-8 text-center">
              <p className="mb-4 text-rose-600 dark:text-rose-300">{error}</p>
              <Button asChild variant="outline">
                <Link to="/community">Back to Community</Link>
              </Button>
            </div>
          ) : hackathons.length === 0 ? (
            <p className="text-evolw-gray-500">No hackathons listed yet. Check back soon.</p>
          ) : (
            <div className="space-y-5">
              {hackathons.map((h) => (
                <article
                  key={h.id}
                  className="rounded-2xl border border-evolw-gray-200 dark:border-white/10 bg-white dark:bg-evolw-slate p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <h2 className="text-xl font-bold text-evolw-black dark:text-white">{h.title}</h2>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200">
                      {h.status}
                    </span>
                  </div>
                  <p className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400 mb-4">
                    {h.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-evolw-gray-500 mb-4">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatRange(h.start_date, h.end_date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {h.mode}
                      {h.location ? ` · ${h.location}` : ''}
                    </span>
                    {h.prize_pool && (
                      <span className="inline-flex items-center gap-1.5">
                        <Trophy className="w-4 h-4" />
                        {h.prize_pool}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(h.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-md bg-evolw-gray-100 dark:bg-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {h.external_registration_url && (
                    <Button asChild variant="accent" size="sm">
                      <a href={h.external_registration_url} target="_blank" rel="noopener noreferrer">
                        Register
                      </a>
                    </Button>
                  )}
                </article>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
