import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, GitBranch, Trophy, Calendar, Users, ExternalLink, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Container } from '../components/ui/container';
import { Section } from '../components/ui/section';
import { Button } from '../components/ui/button';
import { SEO } from '../components/common/seo';
import { communityApi } from '../lib/community-api';
import type { DiscourseTopic } from '../lib/discourse';

type HubProject = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  status: string;
  technologies: string[] | null;
};

type HubHackathon = {
  id: string;
  slug: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  organizer: string | null;
};

export function Community() {
  const [trending, setTrending] = useState<DiscourseTopic[]>([]);
  const [topWeekly, setTopWeekly] = useState<DiscourseTopic[]>([]);
  const [projects, setProjects] = useState<HubProject[]>([]);
  const [hackathons, setHackathons] = useState<HubHackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [discussionsUnavailable, setDiscussionsUnavailable] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [discussionsResult, projectsResult, hackathonsResult] = await Promise.allSettled([
        Promise.all([
          communityApi.discussions('latest', '6'),
          communityApi.discussions('top', '6'),
        ]),
        communityApi.projects(),
        communityApi.hackathons(),
      ]);

      if (discussionsResult.status === 'fulfilled') {
        const [trendingData, topData] = discussionsResult.value;
        setTrending(trendingData.topics || []);
        setTopWeekly(topData.topics || []);
        setDiscussionsUnavailable(Boolean(trendingData.degraded));
      } else {
        setDiscussionsUnavailable(true);
      }

      if (projectsResult.status === 'fulfilled') {
        setProjects((projectsResult.value.projects || []).slice(0, 3));
      }
      if (hackathonsResult.status === 'fulfilled') {
        setHackathons((hackathonsResult.value.hackathons || []).slice(0, 2));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const discourseUrl = (topic: DiscourseTopic) =>
    `${import.meta.env.VITE_COMMUNITY_BASE_URL || 'https://community.evolw.in'}/t/${topic.slug}/${topic.id}`;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <>
      <SEO
        title="Community — EVOLW"
        description="Join EVOLW's developer community. Discuss technology, share open-source contributions, showcase projects, discover hackathons, and accelerate your growth."
        path="/community"
      />

      {/* Hero */}
      <Section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24">
        <Container className="relative z-10">
          <div className="liquid-glass liquid-glass--hero max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <span className="liquid-glass liquid-glass--chip inline-flex items-center gap-2 text-evolw-accent text-sm font-semibold uppercase tracking-wider">
                Developer Community
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance text-evolw-black dark:text-white mb-6"
            >
              Build. Learn. Contribute. Grow.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg sm:text-xl text-evolw-gray-700 dark:text-evolw-gray-300 max-w-2xl mx-auto mb-10"
            >
              A curated space for developers to discuss technology, share open-source contributions,
              showcase projects, discover hackathons, and accelerate their growth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full">
                <a
                  href={`${import.meta.env.VITE_COMMUNITY_BASE_URL || 'https://community.evolw.in'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white transition-colors"
                >
                  Join Community <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full">
                <Link to="/community/open-source">Explore Open Source</Link>
              </Button>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Trending Discussions */}
      <Section className="py-16 sm:py-24">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-evolw-black dark:text-white">
                Trending Discussions
              </h2>
              <p className="text-evolw-gray-500 dark:text-evolw-gray-400 mt-1">
                Most active conversations in the community right now
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <a
                href={`${import.meta.env.VITE_COMMUNITY_BASE_URL || 'https://community.evolw.in'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-evolw-accent transition-colors"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <DiscussionSkeleton key={i} />)}
            </div>
          ) : discussionsUnavailable || trending.length === 0 ? (
            <div className="p-8 rounded-2xl bg-evolw-gray-50 dark:bg-white/5 border border-evolw-gray-200 dark:border-white/10 text-center">
              <MessageSquare className="w-10 h-10 text-evolw-gray-300 dark:text-evolw-gray-600 mx-auto mb-3" />
              <p className="text-evolw-gray-600 dark:text-evolw-gray-300 font-medium mb-2">
                {discussionsUnavailable
                  ? 'Forum discussions are coming soon'
                  : 'No discussions yet. Be the first to start a conversation!'}
              </p>
              <p className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400 mb-5 max-w-md mx-auto">
                {discussionsUnavailable
                  ? 'Meanwhile, explore open-source projects, showcases, and hackathons below.'
                  : 'Join the community to kick off the first thread.'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link to="/community/projects">Browse projects</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <a
                    href={`${import.meta.env.VITE_COMMUNITY_BASE_URL || 'https://community.evolw.in'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit forum <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {trending.map((topic, i) => (
                <DiscussionCard
                  key={topic.id}
                  topic={topic}
                  index={i}
                  discourseUrl={discourseUrl(topic)}
                  formatNumber={formatNumber}
                  getInitials={getInitials}
                />
              ))}
            </motion.div>
          )}
        </Container>
      </Section>

      {/* Featured projects (seeded / live data) */}
      {projects.length > 0 && (
        <Section className="py-16 sm:py-24 bg-evolw-gray-50/55 dark:bg-evolw-black/40 backdrop-blur-[2px]">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-evolw-black dark:text-white">
                  Featured projects
                </h2>
                <p className="text-evolw-gray-500 dark:text-evolw-gray-400 mt-1">
                  Live showcase from the community catalog
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/community/projects" className="flex items-center gap-2 text-evolw-accent">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.35 }}
                >
                  <Link
                    to={`/community/projects/${project.slug}`}
                    className="block h-full bg-white dark:bg-evolw-slate p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10 hover:border-evolw-accent/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-evolw-accent">
                        {project.status}
                      </span>
                      <GitBranch className="w-4 h-4 text-evolw-gray-400" />
                    </div>
                    <h3 className="font-bold text-lg text-evolw-black dark:text-white mb-2">
                      {project.name}
                    </h3>
                    <p className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400 line-clamp-2 mb-4">
                      {project.tagline || 'Community project'}
                    </p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 text-xs rounded-full bg-evolw-gray-100 dark:bg-white/10 text-evolw-gray-600 dark:text-evolw-gray-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Hackathons preview */}
      {hackathons.length > 0 && (
        <Section className="py-16 sm:py-24">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-evolw-black dark:text-white">
                  Upcoming hackathons
                </h2>
                <p className="text-evolw-gray-500 dark:text-evolw-gray-400 mt-1">
                  Compete, ship, and get discovered
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/community/hackathons" className="flex items-center gap-2 text-evolw-accent">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hackathons.map((hack, i) => (
                <motion.div
                  key={hack.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.35 }}
                  className="bg-white dark:bg-evolw-slate p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10"
                >
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-semibold mb-3">
                    <Calendar className="w-4 h-4" />
                    {new Date(hack.start_date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' – '}
                    {new Date(hack.end_date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <h3 className="font-bold text-xl text-evolw-black dark:text-white mb-2">{hack.title}</h3>
                  <p className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400 line-clamp-2 mb-4">
                    {hack.description}
                  </p>
                  <Link
                    to="/community/hackathons"
                    className="text-sm font-medium text-evolw-accent inline-flex items-center gap-1 hover:underline"
                  >
                    Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Top This Week */}
      {topWeekly.length > 0 && (
        <Section className="py-16 sm:py-24 bg-evolw-gray-50/55 dark:bg-evolw-black/40 backdrop-blur-[2px]">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-evolw-black dark:text-white">
                  Popular This Week
                </h2>
                <p className="text-evolw-gray-500 dark:text-evolw-gray-400 mt-1">
                  Top discussions by engagement and activity
                </p>
              </div>
              <a
                href={`${import.meta.env.VITE_COMMUNITY_BASE_URL || 'https://community.evolw.in'}/top/weekly`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-evolw-accent font-medium hover:underline flex items-center gap-2"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topWeekly.map((topic, i) => (
                <DiscussionCard
                  key={topic.id}
                  topic={topic}
                  index={i}
                  discourseUrl={discourseUrl(topic)}
                  formatNumber={formatNumber}
                  getInitials={getInitials}
                  variant="compact"
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Community Sections Grid */}
      <Section className="py-16 sm:py-24">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-evolw-black dark:text-white mb-3">
              Explore the Ecosystem
            </h2>
            <p className="text-evolw-gray-500 dark:text-evolw-gray-400 max-w-2xl mx-auto">
              Discover open-source projects, showcase your work, join hackathons, and attend events
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <a href="/community/open-source" className="group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white dark:bg-evolw-slate p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10 hover:border-evolw-accent/30 dark:hover:border-evolw-accent/30 transition-colors h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-evolw-accent/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <GitBranch className="w-6 h-6 text-evolw-accent" />
                </div>
                <h3 className="font-bold text-lg text-evolw-black dark:text-white mb-2">Open Source</h3>
                <p className="text-evolw-gray-500 dark:text-evolw-gray-400 text-sm mb-4">
                  Discover EVOLW's open-source projects, good first issues, and contribution opportunities
                </p>
                <span className="text-sm font-medium text-evolw-accent flex items-center gap-1">
                  Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.div>
            </a>

            <a href="/community/projects" className="group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white dark:bg-evolw-slate p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10 hover:border-evolw-accent/30 dark:hover:border-evolw-accent/30 transition-colors h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Trophy className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="font-bold text-lg text-evolw-black dark:text-white mb-2">Project Showcase</h3>
                <p className="text-evolw-gray-500 dark:text-evolw-gray-400 text-sm mb-4">
                  Showcase your projects, find collaborators, and get discovered by the community
                </p>
                <span className="text-sm font-medium text-emerald-500 flex items-center gap-1">
                  Browse Projects <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.div>
            </a>

            <a href="/community/hackathons" className="group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white dark:bg-evolw-slate p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10 hover:border-evolw-accent/30 dark:hover:border-evolw-accent/30 transition-colors h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="font-bold text-lg text-evolw-black dark:text-white mb-2">Hackathons</h3>
                <p className="text-evolw-gray-500 dark:text-evolw-gray-400 text-sm mb-4">
                  Discover upcoming hackathons, register, and compete with developers worldwide
                </p>
                <span className="text-sm font-medium text-amber-500 flex items-center gap-1">
                  View Hackathons <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.div>
            </a>

            <a href="/community/events" className="group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white dark:bg-evolw-slate p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10 hover:border-evolw-accent/30 dark:hover:border-evolw-accent/30 transition-colors h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6 text-violet-500" />
                </div>
                <h3 className="font-bold text-lg text-evolw-black dark:text-white mb-2">Events</h3>
                <p className="text-evolw-gray-500 dark:text-evolw-gray-400 text-sm mb-4">
                  Workshops, AMAs, webinars, and meetups to level up your skills
                </p>
                <span className="text-sm font-medium text-violet-500 flex items-center gap-1">
                  See Events <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.div>
            </a>
          </div>
        </Container>
      </Section>

      {/* CTA to Community */}
      <Section className="py-16 sm:py-24">
        <Container>
          <div className="bg-gradient-to-r from-evolw-accent to-blue-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-white text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Join the Conversation?</h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8 text-lg">
              Create your account on the EVOLW Community and start discussing, learning, and contributing today.
            </p>
            <a
              href={`${import.meta.env.VITE_COMMUNITY_BASE_URL || 'https://community.evolw.in'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-evolw-accent hover:bg-evolw-gray-100 h-12 px-10 rounded-full flex items-center justify-center gap-2 text-black font-semibold transition-colors"
            >
              Join Community <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </div>
        </Container>
      </Section>
    </>
  );
}

interface DiscussionCardProps {
  topic: DiscourseTopic;
  index: number;
  discourseUrl: string;
  formatNumber: (num: number) => string;
  getInitials: (name: string | null | undefined) => string;
  variant?: 'default' | 'compact';
}

function DiscussionCard({
  topic,
  index,
  discourseUrl,
  formatNumber,
  getInitials,
  variant = 'default',
}: DiscussionCardProps) {
  const firstPoster = topic.posters[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-evolw-slate p-5 sm:p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10 hover:border-evolw-accent/30 dark:hover:border-evolw-accent/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {topic.tags.slice(0, variant === 'compact' ? 2 : 3).map((tag: string) => (
          <span
            key={tag}
            className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-evolw-gray-100 dark:bg-white/10 text-evolw-gray-600 dark:text-evolw-gray-300 border border-evolw-gray-200 dark:border-white/10"
          >
            {tag}
          </span>
        ))}
      </div>
      <h3 className="font-bold text-lg text-evolw-black dark:text-white mb-2 line-clamp-2">
        <a
          href={discourseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-evolw-accent transition-colors"
        >
          {topic.title}
        </a>
      </h3>

      {variant !== 'compact' && (
        <>
          <div className="flex flex-wrap items-center gap-4 text-sm text-evolw-gray-500 dark:text-evolw-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {formatNumber(topic.posts_count)} replies
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {formatNumber(topic.like_count)} likes
            </span>
            <span className="flex items-center gap-1">
              <ExternalLink className="w-4 h-4" />
              {formatNumber(topic.views)} views
            </span>
          </div>
        </>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-evolw-gray-100 dark:border-white/10">
        {firstPoster && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-evolw-accent/10 flex items-center justify-center">
              <span className="text-xs font-bold text-evolw-accent">
                {getInitials(firstPoster.name)}
              </span>
            </div>
            <span className="text-sm font-medium text-evolw-gray-600 dark:text-evolw-gray-300 truncate max-w-[120px]">
              {firstPoster.name || 'Anonymous'}
            </span>
          </div>
        )}
        <span className="text-xs text-evolw-gray-400">
          {new Date(topic.last_posted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </motion.article>
  );
}

function DiscussionSkeleton() {
  return (
    <div className="bg-white dark:bg-evolw-slate p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10 animate-pulse">
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-20 bg-evolw-gray-200 dark:bg-white/10 rounded-full" />
        <div className="h-5 w-20 bg-evolw-gray-200 dark:bg-white/10 rounded-full" />
      </div>
      <div className="h-6 w-3/4 bg-evolw-gray-200 dark:bg-white/10 rounded mb-2" />
      <div className="h-6 w-full bg-evolw-gray-200 dark:bg-white/10 rounded mb-4" />
      <div className="flex gap-4">
        <div className="h-5 w-24 bg-evolw-gray-200 dark:bg-white/10 rounded" />
        <div className="h-5 w-24 bg-evolw-gray-200 dark:bg-white/10 rounded" />
        <div className="h-5 w-24 bg-evolw-gray-200 dark:bg-white/10 rounded" />
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-evolw-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-evolw-gray-200 dark:bg-white/10" />
          <div className="h-4 w-20 bg-evolw-gray-200 dark:bg-white/10 rounded" />
        </div>
        <div className="h-3 w-16 bg-evolw-gray-200 dark:bg-white/10 rounded" />
      </div>
    </div>
  );
}