/** Server-side Discourse client for community discussions API. */

export interface DiscourseTopic {
  id: number;
  title: string;
  slug: string;
  category_id: number;
  tags: string[];
  posts_count: number;
  views: number;
  like_count: number;
  last_posted_at: string;
  created_at: string;
  bumped_at: string;
  posters: Array<{
    user_id: number;
    name: string | null;
    avatar_template: string;
    description: string | null;
  }>;
  category_slug?: string;
}

interface DiscourseTopicList {
  topic_list: {
    topics: DiscourseTopic[];
  };
}

class DiscourseAPI {
  constructor(
    private baseUrl: string,
    private apiKey: string,
    private apiUsername: string
  ) {}

  isConfigured() {
    return Boolean(this.baseUrl && this.apiKey);
  }

  private async fetchJson<T>(path: string): Promise<T | null> {
    if (!this.isConfigured()) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          'Api-Key': this.apiKey,
          'Api-Username': this.apiUsername,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  async getLatestTopics(limit = 10): Promise<DiscourseTopic[]> {
    const data = await this.fetchJson<DiscourseTopicList>(`/latest.json?limit=${limit}`);
    return data?.topic_list?.topics || [];
  }

  async getTopTopics(
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all' = 'weekly',
    limit = 10
  ): Promise<DiscourseTopic[]> {
    const data = await this.fetchJson<DiscourseTopicList>(`/top/${period}.json?limit=${limit}`);
    return data?.topic_list?.topics || [];
  }

  async getCategoryTopics(categorySlug: string, limit = 10): Promise<DiscourseTopic[]> {
    const data = await this.fetchJson<DiscourseTopicList>(
      `/c/${categorySlug}.json?limit=${limit}`
    );
    return data?.topic_list?.topics || [];
  }
}

export function getDiscourse() {
  return new DiscourseAPI(
    process.env.DISCOURSE_BASE_URL || process.env.COMMUNITY_BASE_URL || '',
    process.env.DISCOURSE_API_KEY || '',
    process.env.DISCOURSE_API_USERNAME || 'system'
  );
}
