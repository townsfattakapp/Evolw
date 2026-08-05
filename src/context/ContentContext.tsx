import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../lib/api';

export interface ContentState {
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    titleHighlight: string;
    subtitle: string;
  };
  products?: unknown[];
  [key: string]: unknown;
}

const defaultContent: ContentState = {
  hero: {
    badge: 'Software • Products • Technology',
    titleLine1: 'We build technology',
    titleLine2: 'that moves businesses',
    titleHighlight: 'forward.',
    subtitle:
      'EVOLW designs and builds modern software products, digital platforms and technology infrastructure for businesses ready to scale.',
  },
  products: [
    {
      id: 'fattakse',
      name: 'Fattakse',
      tagline: 'A Unit of Evolw',
      description:
        'A connected commerce platform designed to bring local businesses, customers and commerce infrastructure together natively.',
      websiteUrl: 'https://fattakse.in',
      appStoreUrl: 'https://apps.apple.com/in/app/fattakse/id6785628271',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.fattakse.user&hl=en_IN',
      features: [
        'Local Commerce',
        'Business OS',
        'Smart Ordering',
        'Live Inventory',
        'Mobile POS',
        'Real-time Data',
      ],
      status: 'live',
      isFeatured: true,
    },
  ],
};

interface ContentContextType {
  content: ContentState;
  updateContent: (newContent: ContentState) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContentState>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await api.getContent();
        setContent({ ...defaultContent, ...(data as ContentState) });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch content, using defaults:', err);
        setError('Failed to load site content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  const updateContent = async (newContent: ContentState) => {
    try {
      await api.saveContent(newContent);
      setContent(newContent);
      return true;
    } catch (err) {
      console.error('Failed to save content:', err);
      return false;
    }
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, isLoading, error }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
