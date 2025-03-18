import { fetcher } from '@/lib/utils/fetcher';
import { useState, useCallback, useEffect } from 'react';
import { PortfolioCategory } from '@/types/portfolio';

export interface PageContent {
  id?: string;
  pageName: string;
  content: Record<string, unknown>;
  updatedAt?: string;
  createdAt?: string;
}

export interface HomePageContent {
  hero: {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    slides?: Array<{
      id: number;
      image: string;
      alt: string;
      category: string;
    }>;
  };
  introduction?: {
    title: string;
    content: string;
    image?: string;
  };
  services?: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    gradient: string;
    details: string[];
  }>;
  portfolio?: {
    title: string;
    description?: string;
    featuredCategory?: string;
  };
}

export interface AboutPageContent {
  hero?: {
    title: string;
    subtitle: string;
    backgroundImage?: string;
  };
  biography: {
    content: string;
    image?: string;
  };
  personalInfo?: {
    name: string;
    location: string;
    email: string;
    phone?: string;
  };
  skills?: string[];
  milestones?: Array<{
    id: number;
    year: string;
    title: string;
    description: string;
    icon?: string;
    image?: string;
  }>;
  featuredWork?: Array<{
    id: number;
    image: string;
    title?: string;
    description?: string;
  }>;
}

export interface ContactPageContent {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage?: string;
  };
  contactInfo: {
    email: string;
    phone?: string;
    address?: string;
  };
  socialMedia: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    vimeo?: string;
    behance?: string;
    dribbble?: string;
    github?: string;
  };
  location?: {
    city?: string;
    country?: string;
    showMap?: boolean;
    mapCoordinates?: {
      lat?: number;
      lng?: number;
    };
  };
  formSettings?: {
    enabled?: boolean;
    title?: string;
    description?: string;
    confirmationMessage?: string;
    requiredFields?: {
      name?: boolean;
      phone?: boolean;
      subject?: boolean;
    };
    danceStyles?: {
      enabled?: boolean;
      options?: string[];
    };
  };
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  otherWaysToConnect?: {
    title?: string;
    description?: string;
  };
}

export interface PortfolioPageContent {
  category: PortfolioCategory;
  hero: {
    title: string;
    subtitle: string;
    backgroundImage?: string;
  };
  description: string;
  featuredProjects?: {
    enabled: boolean;
    count: number;
  };
  layout?: {
    columns: 2 | 3 | 4;
    showFilters: boolean;
    showTags: boolean;
    animationStyle?: 'fade' | 'slide' | 'scale' | 'none';
    spacing?: 'tight' | 'medium' | 'relaxed';
    cardStyle?: 'standard' | 'minimal' | 'bordered' | 'glass';
    hoverEffect?: boolean;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

// Get a single page's content
export const getPageContent = async (pageName: string): Promise<PageContent | null> => {
  try {
    const data = await fetcher<PageContent>(`/api/pageContent/${pageName}`);
    return data;
  } catch (error) {
    console.error('Error fetching page content:', error);
    return null;
  }
};

// Validate content before saving
const validatePageContent = (pageName: string, content: Record<string, unknown>): { valid: boolean; message?: string } => {
  switch (pageName) {
    case 'home':
      // Validate home page content
      if (!content.hero) return { valid: false, message: 'Hero section is required' };
      if (typeof content.hero === 'object') {
        const hero = content.hero as Record<string, unknown>;
        // Title and subtitle are now optional
        if (hero.title !== undefined && typeof hero.title !== 'string') {
          return { valid: false, message: 'Hero title must be a string' };
        }
        if (hero.subtitle !== undefined && typeof hero.subtitle !== 'string') {
          return { valid: false, message: 'Hero subtitle must be a string' };
        }
      }
      
      // Introduction is now optional
      if (content.introduction !== undefined) {
        if (typeof content.introduction === 'object') {
          const intro = content.introduction as Record<string, unknown>;
          if (!intro.title) return { valid: false, message: 'Introduction title is required' };
          if (!intro.content) return { valid: false, message: 'Introduction content is required' };
        } else {
          return { valid: false, message: 'Introduction must be an object' };
        }
      }
      
      // If services are provided, validate their structure
      if (content.services && Array.isArray(content.services)) {
        for (let i = 0; i < content.services.length; i++) {
          const service = content.services[i] as Record<string, unknown>;
          if (!service.id) return { valid: false, message: `Service at index ${i} missing id` };
          if (!service.title) return { valid: false, message: `Service at index ${i} missing title` };
          if (!service.description) return { valid: false, message: `Service at index ${i} missing description` };
        }
      }
      
      return { valid: true };
      
    case 'about':
      // Validate about page content
      if (!content.biography) return { valid: false, message: 'Biography section is required' };
      
      return { valid: true };
      
    case 'contact':
      // Validate contact page content
      if (!content.hero) return { valid: false, message: 'Hero section is required' };
      if (!content.contactInfo) return { valid: false, message: 'Contact information is required' };
      
      if (typeof content.contactInfo === 'object') {
        const contactInfo = content.contactInfo as Record<string, unknown>;
        if (!contactInfo.email) return { valid: false, message: 'Contact email is required' };
      }
      
      return { valid: true };
      
    // Add validation for portfolio category pages
    case 'photography':
    case 'film':
    case 'webdev':
    case 'nfts':
    case 'dance':
      // Validate portfolio category page content
      if (!content.hero) return { valid: false, message: 'Hero section is required' };
      if (typeof content.hero === 'object') {
        const hero = content.hero as Record<string, unknown>;
        if (!hero.title) return { valid: false, message: 'Hero title is required' };
        if (!hero.subtitle) return { valid: false, message: 'Hero subtitle is required' };
      }
      
      if (!content.category) return { valid: false, message: 'Category field is required' };
      if (!content.description) return { valid: false, message: 'Description is required' };
      
      // Validate featured projects if provided
      if (content.featuredProjects && typeof content.featuredProjects === 'object') {
        const featured = content.featuredProjects as Record<string, unknown>;
        if (typeof featured.enabled !== 'boolean') {
          return { valid: false, message: 'Featured projects enabled field must be a boolean' };
        }
        if (featured.enabled && (!featured.count || typeof featured.count !== 'number')) {
          return { valid: false, message: 'Featured projects count must be a number when enabled' };
        }
      }
      
      return { valid: true };
      
    default:
      // For other pages, just ensure some content exists
      return { valid: Object.keys(content).length > 0, message: 'Content cannot be empty' };
  }
};

// Update a page's content
export const updatePageContent = async <T extends Record<string, unknown>>(
  pageName: string,
  content: T
): Promise<PageContent | null> => {
  try {
    // Validate content before saving
    const validation = validatePageContent(pageName, content as Record<string, unknown>);
    
    if (!validation.valid) {
      throw new Error(`Validation error: ${validation.message}`);
    }
    
    const response = await fetch(`/api/pageContent/${pageName}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as PageContent;
  } catch (error) {
    console.error('Error updating page content:', error);
    return null;
  }
};

// Upload an image for page content
export const uploadContentImage = async (
  pageName: string,
  section: string,
  file: File
): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pageName', pageName);
    formData.append('section', section);

    const response = await fetch('/api/upload/contentImage', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading content image:', error);
    return null;
  }
};

// Get default content templates for new pages
export const getDefaultPageContent = (pageName: string): Record<string, unknown> => {
  switch (pageName) {
    case 'home':
      const homeDefault: Partial<HomePageContent> = {
        hero: {
          title: 'Visual Storytelling & Creative Work',
          subtitle: 'Photography • Film • Web Development',
          backgroundImage: '/images/hero-bg.jpg',
          slides: [
            {
              id: 1,
              image: '/images/hero/photography.jpg',
              alt: 'Photography Portfolio',
              category: 'Photography'
            },
            {
              id: 2,
              image: '/images/hero/film.jpg',
              alt: 'Film Projects',
              category: 'Film'
            },
            {
              id: 3,
              image: '/images/hero/webdev.jpg',
              alt: 'Web Development',
              category: 'Web Development'
            }
          ]
        },
        introduction: {
          title: 'Hello, I\'m a Creative Professional',
          content: 'I specialize in creating beautiful and impactful work across multiple disciplines.',
          image: '',
        },
        services: [
          {
            id: 'photography',
            title: 'Photography',
            description: 'Creating visually stunning designs that communicate effectively.',
            icon: '🎨',
            gradient: 'from-emerald-500 to-teal-500',
            details: ['Visual Design', 'UI/UX Design']
          }
        ],
        portfolio: {
          title: 'Featured Work',
          description: 'Browse through my latest projects and creations',
          featuredCategory: 'all'
        }
      };
      return homeDefault as Record<string, unknown>;
    case 'about':
      const aboutDefault: Partial<AboutPageContent> = {
        hero: {
          title: 'About Me',
          subtitle: 'Learn about my journey and creative process',
          backgroundImage: '/images/about-bg.jpg'
        },
        biography: {
          content: 'Write your biography here...',
          image: '',
        },
        personalInfo: {
          name: 'Your Name',
          location: 'Your Location',
          email: 'your@email.com',
          phone: '',
        },
      };
      return aboutDefault as Record<string, unknown>;
    case 'contact':
      const contactDefault: Partial<ContactPageContent> = {
        hero: {
          title: 'Let\'s Create Together',
          subtitle: 'I\'m always open to discussing new projects, creative ideas or opportunities to be part of your vision.',
          backgroundImage: '/images/contact-hero.jpg'
        },
        contactInfo: {
          email: 'hello@example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Creative St, Artville, AV 98765'
        },
        socialMedia: {
          instagram: 'https://instagram.com/yourusername',
          twitter: 'https://twitter.com/yourusername',
          facebook: 'https://facebook.com/yourpage',
          linkedin: 'https://linkedin.com/in/yourprofile',
          youtube: '',
          vimeo: 'https://vimeo.com/yourusername',
          behance: '',
          dribbble: '',
          github: ''
        },
        location: {
          city: 'New York',
          country: 'USA',
          showMap: true,
          mapCoordinates: {
            lat: 40.7128,
            lng: -74.0060
          }
        },
        formSettings: {
          enabled: true,
          title: 'Send Me a Message',
          description: 'Fill out the form below and I\'ll get back to you as soon as possible.',
          confirmationMessage: 'Thanks for reaching out! I\'ll get back to you within 1-2 business days.',
          requiredFields: {
            name: true,
            phone: false,
            subject: true
          },
          danceStyles: {
            enabled: true,
            options: ['Ballet', 'Contemporary', 'Hip Hop', 'Jazz', 'Other']
          }
        },
        faqs: [
          {
            question: 'How soon can I expect a response?',
            answer: 'I typically respond to all inquiries within 1-2 business days.'
          },
          {
            question: 'Do you work with international clients?',
            answer: 'Absolutely! I work with clients from all over the world.'
          },
          {
            question: 'What information do you need to get started?',
            answer: 'Project scope, timeline, budget, and any specific requirements or references.'
          },
          {
            question: 'How do we start working together?',
            answer: 'After our initial consultation, I\'ll provide a proposal outlining the project details.'
          }
        ],
        otherWaysToConnect: {
          title: 'Other Ways to Connect',
          description: 'Feel free to reach out through any of these channels.'
        }
      };
      return contactDefault as Record<string, unknown>;
    case 'photography':
      const photogDefault: Partial<PortfolioPageContent> = {
        category: 'photography',
        hero: {
          title: 'Photography Portfolio',
          subtitle: 'Capturing moments and telling stories through the lens',
          backgroundImage: '/images/photography-bg.jpg'
        },
        description: 'Explore my photography work, from portraits to landscapes and everything in between.',
        featuredProjects: {
          enabled: true,
          count: 3,
        },
        layout: {
          columns: 3,
          showFilters: true,
          showTags: true,
          animationStyle: 'fade',
          spacing: 'medium',
          cardStyle: 'standard',
          hoverEffect: true
        },
        seo: {
          title: 'Photography Portfolio',
          description: 'Explore my photography portfolio featuring a variety of styles and subjects.',
          keywords: ['photography', 'portrait', 'landscape', 'portfolio'],
        }
      };
      return photogDefault as Record<string, unknown>;
    case 'film':
      const filmDefault: Partial<PortfolioPageContent> = {
        category: 'film',
        hero: {
          title: 'Film & Video Work',
          subtitle: 'Visual storytelling through motion and emotion',
          backgroundImage: '/images/film-bg.jpg'
        },
        description: 'A collection of my film and video projects, showcasing cinematic storytelling.',
        featuredProjects: {
          enabled: true,
          count: 2,
        },
        layout: {
          columns: 2,
          showFilters: true,
          showTags: true,
          animationStyle: 'slide',
          spacing: 'relaxed',
          cardStyle: 'glass',
          hoverEffect: true
        },
        seo: {
          title: 'Film and Video Projects',
          description: 'View my collection of film and video projects, showcasing storytelling through the moving image.',
          keywords: ['film', 'video', 'cinematography', 'director'],
        }
      };
      return filmDefault as Record<string, unknown>;
    case 'webdev':
      const webdevDefault: Partial<PortfolioPageContent> = {
        category: 'webdev',
        hero: {
          title: 'Web Development Projects',
          subtitle: 'Creating digital experiences with code',
          backgroundImage: '/images/webdev-bg.jpg'
        },
        description: 'Explore my web development projects, from interactive websites to full-stack applications.',
        featuredProjects: {
          enabled: true,
          count: 3,
        },
        layout: {
          columns: 3,
          showFilters: true,
          showTags: true,
          animationStyle: 'scale',
          spacing: 'medium',
          cardStyle: 'bordered',
          hoverEffect: true
        },
        seo: {
          title: 'Web Development Portfolio',
          description: 'Explore my web development work featuring responsive designs and interactive user experiences.',
          keywords: ['web development', 'frontend', 'UI/UX', 'responsive design'],
        }
      };
      return webdevDefault as Record<string, unknown>;
    case 'nfts':
      const nftsDefault: Partial<PortfolioPageContent> = {
        category: 'nfts',
        hero: {
          title: 'NFT Collections',
          subtitle: 'Digital art in the blockchain space',
          backgroundImage: '/images/nfts-bg.jpg'
        },
        description: 'My NFT collections, exploring the intersection of art and blockchain technology.',
        featuredProjects: {
          enabled: true,
          count: 4,
        },
        layout: {
          columns: 4,
          showFilters: true,
          showTags: true,
          animationStyle: 'fade',
          spacing: 'tight',
          cardStyle: 'minimal',
          hoverEffect: true
        },
        seo: {
          title: 'NFT Digital Art Collection',
          description: 'View my NFT digital art collection, where creativity meets blockchain technology.',
          keywords: ['NFT', 'digital art', 'blockchain', 'crypto art'],
        }
      };
      return nftsDefault as Record<string, unknown>;
    case 'dance':
      const danceDefault: Partial<PortfolioPageContent> = {
        category: 'dance',
        hero: {
          title: 'Dance Performances',
          subtitle: 'Expressing emotion through movement',
          backgroundImage: '/images/dance-bg.jpg'
        },
        description: 'A showcase of my dance performances and choreography work.',
        featuredProjects: {
          enabled: true,
          count: 3,
        },
        layout: {
          columns: 3,
          showFilters: true,
          showTags: true,
          animationStyle: 'slide',
          spacing: 'medium',
          cardStyle: 'glass',
          hoverEffect: true
        },
        seo: {
          title: 'Dance and Movement Projects',
          description: 'Explore my dance performances and choreography work across various styles and collaborations.',
          keywords: ['dance', 'choreography', 'movement', 'performance'],
        }
      };
      return danceDefault as Record<string, unknown>;
    default:
      return {};
  }
};

// Utility hook for fetching page content with loading state
export const usePageContent = <T>(
  pageName: string, 
  fallbackContent?: Partial<T>
): { 
  content: Partial<T> | null; 
  isLoading: boolean; 
  error: Error | null;
  refresh: () => Promise<void>;
} => {
  const [content, setContent] = useState<Partial<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getPageContent(pageName);
      
      if (data && data.content) {
        setContent(data.content as unknown as Partial<T>);
      } else {
        // If no content is found, use the default content
        const defaultContent = getDefaultPageContent(pageName) as unknown as Partial<T>;
        setContent(defaultContent || fallbackContent || null);
      }
    } catch (err) {
      console.error(`Error loading ${pageName} content:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      // Fall back to default content on error
      if (fallbackContent) {
        setContent(fallbackContent);
      }
    } finally {
      setIsLoading(false);
    }
  }, [pageName, fallbackContent]);

  // Load content on mount and when pageName changes
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Function to manually refresh content
  const refresh = async () => {
    await fetchContent();
  };

  return { content, isLoading, error, refresh };
}; 