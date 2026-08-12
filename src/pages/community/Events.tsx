import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Loader2, MapPin, Mic2 } from 'lucide-react';
import { Container } from '../../components/ui/container';
import { Section } from '../../components/ui/section';
import { Button } from '../../components/ui/button';
import { SEO } from '../../components/common/seo';
import { communityApi } from '../../lib/community-api';

type CommunityEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  event_type: string;
  speaker: string | null;
  start_date: string;
  timezone: string;
  location: string | null;
  is_online: boolean;
  external_registration_url: string | null;
};

export function Events() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    communityApi
      .events()
      .then((data) => setEvents(data.events || []))
      .catch(() => setError('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO
        title="Events — EVOLW Community"
        description="Workshops, AMAs, and community events from EVOLW."
        path="/community/events"
      />
      <Section className="pt-20 pb-16 sm:pt-28 sm:pb-24">
        <Container className="max-w-3xl">
          <Link to="/community" className="text-sm font-semibold text-evolw-accent hover:underline">
            ← Community
          </Link>
          <h1 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-evolw-black dark:text-white">
            Events
          </h1>
          <p className="mt-3 text-evolw-gray-500 dark:text-evolw-gray-400 text-lg mb-10">
            Learn live with the EVOLW team and community.
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
          ) : events.length === 0 ? (
            <p className="text-evolw-gray-500">No upcoming events yet.</p>
          ) : (
            <div className="space-y-5">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="rounded-2xl border border-evolw-gray-200 dark:border-white/10 bg-white dark:bg-evolw-slate p-6"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200">
                      {event.event_type}
                    </span>
                    <span className="text-xs text-evolw-gray-400">
                      {event.is_online ? 'Online' : 'In person'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-evolw-black dark:text-white mb-2">
                    {event.title}
                  </h2>
                  <p className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400 mb-4">
                    {event.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-evolw-gray-500 mb-4">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.start_date).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      ({event.timezone})
                    </span>
                    {event.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </span>
                    )}
                    {event.speaker && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mic2 className="w-4 h-4" />
                        {event.speaker}
                      </span>
                    )}
                  </div>
                  {event.external_registration_url && (
                    <Button asChild variant="accent" size="sm">
                      <a
                        href={event.external_registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Join / Register
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
