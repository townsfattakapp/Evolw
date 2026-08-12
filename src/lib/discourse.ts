export interface DiscourseUser {
  id: number;
  username: string;
  name: string | null;
  avatar_template: string;
  trust_level: number;
}

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

export interface DiscourseCategory {
  id: number;
  name: string;
  slug: string;
  color: string;
  text_color: string;
  topic_count: number;
  description: string;
  description_text: string;
}

export interface DiscourseTopicList {
  topic_list: {
    topics: DiscourseTopic[];
    categories: DiscourseCategory[];
    users: DiscourseUser[];
  };
}

export interface DiscourseCategoryList {
  category_list: {
    categories: DiscourseCategory[];
  };
}

export interface DiscourseAPIConfig {
  baseUrl: string;
  apiKey: string;
  apiUsername?: string;
}

class DiscourseAPI {
  private baseUrl: string;
  private apiKey: string;
  private apiUsername: string;

  constructor(config: DiscourseAPIConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.apiUsername = config.apiUsername || 'system';
  }

  private isConfigured(): boolean {
    return Boolean(this.baseUrl && this.apiKey);
  }

  private async fetch<T>(path: string): Promise<T | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          'Api-Key': this.apiKey,
          'Api-Username': this.apiUsername,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Discourse API error: ${res.status} ${res.statusText}`);
      }

      return await res.json();
    } catch (error) {
      console.error('[discourse] API fetch failed:', error);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  async getLatestTopics(limit = 10): Promise<DiscourseTopic[]> {
    const data = await this.fetch<DiscourseTopicList>(`/latest.json?limit=${limit}`);
    return data?.topic_list.topics || [];
  }

  async getTopTopics(period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all' = 'weekly', limit = 10): Promise<DiscourseTopic[]> {
    const data = await this.fetch<DiscourseTopicList>(`/top/${period}.json?limit=${limit}`);
    return data?.topic_list.topics || [];
  }

  async getCategories(): Promise<DiscourseCategory[]> {
    const data = await this.fetch<DiscourseCategoryList>(`/categories.json`);
    return data?.category_list.categories || [];
  }

  async getCategoryTopics(categorySlug: string, limit = 10): Promise<DiscourseTopic[]> {
    const data = await this.fetch<DiscourseTopicList>(`/c/${categorySlug}.json?limit=${limit}`);
    return data?.topic_list.topics || [];
  }

  async getTopic(topicId: number): Promise<DiscourseTopic | null> {
    const data = await this.fetch<{ topic: DiscourseTopic }>(`/t/${topicId}.json`);
    return data?.topic || null;
  }

  getTopicUrl(topic: DiscourseTopic): string {
    const communityUrl = process.env.COMMUNITY_BASE_URL || 'https://community.evolw.in';
    return `${communityUrl}/t/${topic.slug}/${topic.id}`;
  }

  getCategoryUrl(categorySlug: string): string {
    const communityUrl = process.env.COMMUNITY_BASE_URL || 'https://community.evolw.in';
    return `${communityUrl}/c/${categorySlug}`;
  }
}

export interface InitializedDiscourse {
  discourse: DiscourseAPI;
  getTopicUrl: (topic: DiscourseTopic) => string;
  getCategoryUrl: (categorySlug: string) => string;
}

export function initializeDiscourse(config: DiscourseAPIConfig): InitializedDiscourse {
  const discourse = new DiscourseAPI(config);
  return {
    discourse,
    getTopicUrl: discourse.getTopicUrl.bind(discourse),
    getCategoryUrl: discourse.getCategoryUrl.bind(discourse),
  };
}

export const discourse = initializeDiscourse({
  baseUrl: process.env.DISCOURSE_BASE_URL || '',
  apiKey: process.env.DISCOURSE_API_KEY || '',
  apiUsername: process.env.DISCOURSE_API_USERNAME || 'system',
});