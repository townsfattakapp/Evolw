import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Define the shape of our content
export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

export interface ContentState {
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    titleHighlight: string;
    subtitle: string;
  };
  jobs: Job[];
}

// Default fallback content in case the API fails
const defaultContent: ContentState = {
  hero: {
    badge: "Software • Products • Technology",
    titleLine1: "We build technology",
    titleLine2: "that moves businesses",
    titleHighlight: "forward.",
    subtitle: "EVOLW designs and builds modern software products, digital platforms and technology infrastructure for businesses ready to scale."
  },
  jobs: []
};

interface ContentContextType {
  content: ContentState;
  updateContent: (newContent: ContentState) => Promise<boolean>;
  isLoading: boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContentState>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch content on mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content');
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error("Failed to fetch content, using defaults:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Function to save content back to the local CMS
  const updateContent = async (newContent: ContentState) => {
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newContent)
      });
      
      if (response.ok) {
        setContent(newContent);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to save content:", error);
      return false;
    }
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, isLoading }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
