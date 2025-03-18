'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from '@/components/ui/GlassPanel';
import { typography, colors, shadows } from '@/components/admin/designSystem';
import CategoryMetadataEditor from './CategoryMetadataEditor';
import PortfolioManager from './PortfolioManager';
import { PortfolioCategory } from '@/types/portfolio';
import { 
  FormInput,
  FormTextarea,
  FormSection,
  Button,
  StatusMessage,
  validators,
  FormToggle
} from './ui/FormComponents';
import {
  HomePageContent,
  AboutPageContent,
  ContactPageContent,
  updatePageContent
} from '@/lib/api/pageContentService';
import PortfolioCategoryForm from './PortfolioCategoryForm';

// Page content tabs interface
export type PageContentTab = {
  id: string;
  label: string;
  icon: string;
  description: string;
};

// Define all the tabs for page content
export const pageContentTabs: PageContentTab[] = [
  {
    id: 'home',
    label: 'Home Page',
    icon: '🏠',
    description: 'Edit your homepage content, slideshow images, and featured items'
  },
  {
    id: 'about',
    label: 'About Page',
    icon: '👤',
    description: 'Manage your biography, skills, and personal information'
  },
  {
    id: 'photography',
    label: 'Photography',
    icon: '📸',
    description: 'Curate your photography portfolio and collections'
  },
  {
    id: 'film',
    label: 'Films',
    icon: '🎬',
    description: 'Showcase your film and video projects'
  },
  {
    id: 'webdev',
    label: 'Web Development',
    icon: '💻',
    description: 'Present your web development and coding projects'
  },
  {
    id: 'nfts',
    label: 'NFTs',
    icon: '🎨',
    description: 'Manage your digital art and NFT collections'
  },
  {
    id: 'dance',
    label: 'Dance',
    icon: '💃',
    description: 'Highlight your dance performances and choreography'
  },
  {
    id: 'contact',
    label: 'Contact Page',
    icon: '✉️',
    description: 'Edit your contact information and form settings'
  }
];

// Animation variants for tab transitions
const tabContentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

interface PageContentTabsProps {
  defaultTab?: string;
}

export default function PageContentTabs({ defaultTab = 'home' }: PageContentTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Home page state
  const [homeContent, setHomeContent] = useState<Partial<HomePageContent>>({
    hero: {
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
        },
        {
          id: 4,
          image: '/images/hero/dance.jpg',
          alt: 'Dance Performance',
          category: 'Dance'
        },
        {
          id: 5,
          image: '/images/hero/nft.jpg',
          alt: 'NFT Collection',
          category: 'NFTs'
        }
      ]
    },
    services: [
      {
        id: 'photography',
        title: 'Photography',
        description: 'Capturing moments through the lens with artistic vision and technical precision.',
        icon: '📸',
        gradient: 'from-blue-500 to-purple-500',
        details: [
          'Portrait Photography',
          'Event Coverage',
          'Fine Art Photography'
        ]
      },
      {
        id: 'film',
        title: 'Film',
        description: 'Creating compelling visual stories through cinematography and editing.',
        icon: '🎬',
        gradient: 'from-purple-500 to-pink-500',
        details: [
          'Short Films',
          'Documentaries',
          'Music Videos'
        ]
      }
    ],
    portfolio: {
      title: 'Featured Work',
      description: 'Browse through my latest projects and creations',
      featuredCategory: 'all'
    }
  });

  // About page state
  const [aboutContent, setAboutContent] = useState<Partial<AboutPageContent>>({
    biography: {
      content: 'Based in Los Angeles, I combine my background in visual arts with technical expertise to create unique multimedia experiences. After graduating from the California Institute of the Arts, I\'ve worked with various brands and galleries to bring creative visions to life.',
      image: '/images/about-portrait.jpg'
    },
    skills: ['Photography', 'Filmmaking', 'Web Development', 'Digital Art', 'Dance'],
    milestones: [
      {
        id: 1,
        year: '2016',
        title: 'Started Photography Journey',
        description: 'Began exploring photography as a medium of creative expression, focusing on urban landscapes and portrait photography.',
        icon: '📸'
      },
      {
        id: 2,
        year: '2018',
        title: 'First Exhibition',
        description: 'Showcased my work at a local gallery, featuring a collection of street photography from around the world.',
        icon: '🖼️'
      },
      {
        id: 3,
        year: '2019',
        title: 'Explored Filmmaking',
        description: 'Ventured into the world of cinema, creating short films that explore themes of identity and culture.',
        icon: '🎬'
      },
      {
        id: 4,
        year: '2020',
        title: 'Web Development Focus',
        description: 'Deepened my technical skills by learning full-stack development, creating interactive web experiences that merge art and technology.',
        icon: '💻'
      },
      {
        id: 5,
        year: '2021',
        title: 'NFT Collection Launch',
        description: 'Released my first digital art collection as NFTs, exploring the intersection of traditional art and blockchain technology.',
        icon: '🎨'
      },
      {
        id: 6,
        year: '2022',
        title: 'Dance Performance Series',
        description: 'Combined my visual arts background with movement, creating a multimedia dance performance that toured multiple venues.',
        icon: '💃'
      },
      {
        id: 7,
        year: '2023',
        title: 'Portfolio Website Launch',
        description: 'Created a comprehensive digital portfolio to showcase my diverse body of work across multiple creative disciplines.',
        icon: '🚀'
      }
    ],
    featuredWork: [
      {
        id: 1,
        image: '/images/about/gallery-1.jpg',
        title: 'Featured Work 1'
      },
      {
        id: 2,
        image: '/images/about/gallery-2.jpg',
        title: 'Featured Work 2'
      },
      {
        id: 3,
        image: '/images/about/gallery-3.jpg',
        title: 'Featured Work 3'
      }
    ]
  });

  // Contact page state
  const [contactContent, setContactContent] = useState<Partial<ContactPageContent>>({
    hero: {
      title: 'Let\'s Create Together',
      subtitle: 'Have a project in mind or want to collaborate? I\'d love to hear from you.',
      backgroundImage: '/images/contact-bg.jpg'
    },
    contactInfo: {
      email: 'contact@hussainmarzooq.com',
      phone: '',
      address: 'Dubai, UAE'
    },
    socialMedia: {
      instagram: 'https://instagram.com/example',
      twitter: 'https://twitter.com/example',
      linkedin: 'https://linkedin.com/in/example',
      github: 'https://github.com/example'
    },
    location: {
      city: 'Dubai',
      country: 'UAE',
      showMap: false,
      mapCoordinates: {
        lat: 25.2048,
        lng: 55.2708
      }
    },
    formSettings: {
      enabled: true,
      title: 'Send Me a Message',
      description: 'Fill out the form below and let\'s bring your vision to life.',
      confirmationMessage: 'Thanks for reaching out! I\'ll get back to you soon.',
      requiredFields: {
        name: true,
        phone: false,
        subject: false
      },
      danceStyles: {
        enabled: true,
        options: ['Ballet', 'Contemporary', 'Hip Hop', 'Jazz', 'Other']
      }
    },
    faqs: [
      {
        question: "What's the typical response time?",
        answer: "I aim to respond to all inquiries within 24-48 hours during business days."
      },
      {
        question: "Do you work internationally?",
        answer: "Yes, I collaborate with clients worldwide and can accommodate different time zones."
      },
      {
        question: "What information should I include?",
        answer: "Please provide project details, timeline, and any specific requirements you have in mind."
      },
      {
        question: "How do we start a project?",
        answer: "After initial contact, we'll schedule a consultation to discuss your needs in detail."
      }
    ],
    otherWaysToConnect: {
      title: 'Other Ways to Connect',
      description: 'You can also reach me through these channels.'
    }
  });
  
  // Map tab IDs to portfolio categories when applicable
  const getPortfolioCategory = (tabId: string): PortfolioCategory | null => {
    const validCategories: PortfolioCategory[] = ['photography', 'film', 'webdev', 'nfts', 'dance'];
    return validCategories.includes(tabId as PortfolioCategory) 
      ? (tabId as PortfolioCategory) 
      : null;
  };

  // Handle form submission for home page
  const handleHomeFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormStatus(null);

    try {
      const result = await updatePageContent('home', homeContent);
      if (result) {
        setFormStatus({ 
          type: 'success', 
          message: 'Home page content saved successfully! Content on the live site will be updated.' 
        });
        
        // Add a slight delay before triggering a preview refresh (if available)
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          setTimeout(() => {
            // Dispatch a custom event that content preview components can listen for
            window.dispatchEvent(new CustomEvent('content-updated', { 
              detail: { pageName: 'home' } 
            }));
          }, 1000);
        }
      } else {
        throw new Error('Failed to save content. Please check the form and try again.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setFormStatus({ 
        type: 'error', 
        message: `Failed to save home page content: ${errorMessage}` 
      });
      console.error('Error saving home page content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form submission for about page
  const handleAboutFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormStatus(null);

    try {
      const result = await updatePageContent('about', aboutContent);
      if (result) {
        setFormStatus({ 
          type: 'success', 
          message: 'About page content saved successfully! Content on the live site will be updated.' 
        });
        
        // Add a slight delay before triggering a preview refresh (if available)
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          setTimeout(() => {
            // Dispatch a custom event that content preview components can listen for
            window.dispatchEvent(new CustomEvent('content-updated', { 
              detail: { pageName: 'about' } 
            }));
          }, 1000);
        }
      } else {
        throw new Error('Failed to save content. Please check the form and try again.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setFormStatus({ 
        type: 'error', 
        message: `Failed to save about page content: ${errorMessage}` 
      });
      console.error('Error saving about page content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form submission for contact page
  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormStatus(null);

    try {
      const result = await updatePageContent('contact', contactContent);
      if (result) {
        setFormStatus({ 
          type: 'success', 
          message: 'Contact page content saved successfully! Content on the live site will be updated.' 
        });
        
        // Add a slight delay before triggering a preview refresh (if available)
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          setTimeout(() => {
            // Dispatch a custom event that content preview components can listen for
            window.dispatchEvent(new CustomEvent('content-updated', { 
              detail: { pageName: 'contact' } 
            }));
          }, 1000);
        }
      } else {
        throw new Error('Failed to save content. Please check the form and try again.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setFormStatus({ 
        type: 'error', 
        message: `Failed to save contact page content: ${errorMessage}` 
      });
      console.error('Error saving contact page content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Update about content fields
  const updateAboutContent = (field: string, subfield: string, value: string) => {
    setAboutContent(prev => {
      const currentField = prev[field as keyof AboutPageContent] || {};
      return {
        ...prev,
        [field]: {
          ...currentField,
          [subfield]: value
        }
      };
    });
  };

  // Update contact content fields
  const updateContactContent = (field: string, subfield: string, value: string) => {
    setContactContent(prev => ({
      ...prev,
      [field]: {
        ...prev[field as keyof ContactPageContent],
        [subfield]: value
      }
    }));
  };

  // Helper for updating hero slides
  const updateHeroSlide = (index: number, field: string, value: string) => {
    setHomeContent(prev => {
      const updatedSlides = [...(prev.hero?.slides || [])];
      updatedSlides[index] = {
        ...updatedSlides[index],
        [field]: value
      };
      
      return {
        ...prev,
        hero: {
          ...prev.hero,
          slides: updatedSlides
        }
      };
    });
  };

  // Helper for adding a new hero slide
  const addHeroSlide = () => {
    setHomeContent(prev => {
      const slides = [...(prev.hero?.slides || [])];
      // Ensure we generate a valid ID even if slides array is empty or has invalid IDs
      const newId = slides.length > 0 
        ? Math.max(...slides.map(slide => typeof slide.id === 'number' && !isNaN(slide.id) ? slide.id : 0)) + 1 
        : 1;
      
      return {
        ...prev,
        hero: {
          ...prev.hero,
          slides: [
            ...slides,
            {
              id: newId,
              image: '',
              alt: 'New Slide',
              category: 'New Category'
            }
          ]
        }
      };
    });
  };

  // Helper for removing a hero slide
  const removeHeroSlide = (index: number) => {
    setHomeContent(prev => {
      const updatedSlides = [...(prev.hero?.slides || [])];
      updatedSlides.splice(index, 1);
      
      return {
        ...prev,
        hero: {
          ...prev.hero,
          slides: updatedSlides
        }
      };
    });
  };

  // Helper for updating service items
  const updateService = (index: number, field: string, value: string | string[]) => {
    setHomeContent(prev => {
      const updatedServices = [...(prev.services || [])];
      
      // If updating the ID and value is empty, keep the existing ID or use a fallback
      if (field === 'id' && (!value || value === '')) {
        value = updatedServices[index].id || `service-${index}`;
      }
      
      updatedServices[index] = {
        ...updatedServices[index],
        [field]: value
      };
      
      return {
        ...prev,
        services: updatedServices
      };
    });
  };

  // Helper for updating service details
  const updateServiceDetail = (serviceIndex: number, detailIndex: number, value: string) => {
    setHomeContent(prev => {
      const updatedServices = [...(prev.services || [])];
      const updatedDetails = [...(updatedServices[serviceIndex].details || [])];
      updatedDetails[detailIndex] = value;
      
      updatedServices[serviceIndex] = {
        ...updatedServices[serviceIndex],
        details: updatedDetails
      };
      
      return {
        ...prev,
        services: updatedServices
      };
    });
  };

  // Helper for adding a new service
  const addService = () => {
    setHomeContent(prev => {
      const services = [...(prev.services || [])];
      const serviceCount = services.length + 1;
      const newId = `service-${serviceCount}`;
      
      return {
        ...prev,
        services: [
          ...services,
          {
            id: newId,
            title: 'New Service',
            description: 'Service description',
            icon: '✨',
            gradient: 'from-blue-500 to-purple-500',
            details: ['Service detail 1', 'Service detail 2']
          }
        ]
      };
    });
  };

  // Helper for removing a service
  const removeService = (index: number) => {
    setHomeContent(prev => {
      const updatedServices = [...(prev.services || [])];
      updatedServices.splice(index, 1);
      
      return {
        ...prev,
        services: updatedServices
      };
    });
  };

  // Helper for adding a service detail
  const addServiceDetail = (serviceIndex: number) => {
    setHomeContent(prev => {
      const updatedServices = [...(prev.services || [])];
      const updatedDetails = [...(updatedServices[serviceIndex].details || [])];
      updatedDetails.push(`New detail ${updatedDetails.length + 1}`);
      
      updatedServices[serviceIndex] = {
        ...updatedServices[serviceIndex],
        details: updatedDetails
      };
      
      return {
        ...prev,
        services: updatedServices
      };
    });
  };

  // Helper for removing a service detail
  const removeServiceDetail = (serviceIndex: number, detailIndex: number) => {
    setHomeContent(prev => {
      const updatedServices = [...(prev.services || [])];
      const updatedDetails = [...(updatedServices[serviceIndex].details || [])];
      updatedDetails.splice(detailIndex, 1);
      
      updatedServices[serviceIndex] = {
        ...updatedServices[serviceIndex],
        details: updatedDetails
      };
      
      return {
        ...prev,
        services: updatedServices
      };
    });
  };

  // Render the content based on the active tab
  const renderTabContent = () => {
    const portfolioCategory = getPortfolioCategory(activeTab);
    
    // For portfolio category tabs, show the portfolio editor
    if (portfolioCategory) {
      return (
        <div className="space-y-6">
          <div className="lg:flex lg:gap-6">
            <div className="lg:flex-1 space-y-6">
              <div className="bg-gray-800/70 backdrop-blur border border-gray-700/50 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700/50">
                  <h3 className={`${typography.heading.h3}`}>
                    {portfolioCategory.charAt(0).toUpperCase() + portfolioCategory.slice(1)} Page Content
                  </h3>
                  <p className={`${typography.body.small} ${colors.text.secondary} mt-1`}>
                    Edit the main content for this portfolio category page
                  </p>
                </div>
                <PortfolioCategoryForm category={portfolioCategory} />
              </div>
              <CategoryMetadataEditor category={portfolioCategory} />
              <PortfolioManager category={portfolioCategory} />
            </div>
          </div>
        </div>
      );
    }
    
    // For other tabs, render specific editors
    switch (activeTab) {
      case 'home':
        return (
          <div className="p-6">
            <h3 className={`${typography.heading.h3} mb-4 ${colors.text.primary}`}>Home Page Content</h3>
            <p className={`${typography.body.base} ${colors.text.secondary} mb-6`}>
              Edit your homepage content, including slideshow images, featured work, and service sections.
            </p>

            {formStatus && (
              <StatusMessage
                type={formStatus.type}
                message={formStatus.message}
                onDismiss={() => setFormStatus(null)}
              />
            )}
            
            <div className="lg:flex lg:gap-8">
              <div className="lg:flex-1">
                <form onSubmit={handleHomeFormSubmit}>
                  
                  {/* Hero Slides Section */}
                  <FormSection title="Hero Background Slideshow">
                    <p className={`${typography.body.small} ${colors.text.secondary} mb-4`}>
                      Manage slideshow images displayed in the hero section background. Each slide has a category that&apos;s highlighted in the subtitle.
                    </p>
                    
                    {(homeContent.hero?.slides || []).map((slide, index) => (
                      <div key={`hero-slide-${typeof slide.id !== 'undefined' && slide.id !== null ? slide.id : index}`} className="mb-6 p-4 border border-white/10 rounded-lg bg-black/20">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-white">Slide {index + 1}</h4>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeHeroSlide(index)}
                            aria-label="Remove slide"
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          <FormInput
                            id={`slide-${index}-image`}
                            label="Image URL"
                            defaultValue={slide.image}
                            placeholder="Enter image URL"
                            type="url"
                            validate={validators.url}
                            onChange={(value) => updateHeroSlide(index, 'image', value)}
                          />
                          
                          <FormInput
                            id={`slide-${index}-alt`}
                            label="Alt Text"
                            defaultValue={slide.alt}
                            placeholder="Enter alt text"
                            onChange={(value) => updateHeroSlide(index, 'alt', value)}
                          />
                          
                          <FormInput
                            id={`slide-${index}-category`}
                            label="Category Name"
                            defaultValue={slide.category}
                            placeholder="Enter category name"
                            helpText="This text will be animated in the hero subtitle"
                            onChange={(value) => updateHeroSlide(index, 'category', value)}
                          />
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4">
                      <Button
                        variant="secondary"
                        onClick={addHeroSlide}
                        className="w-full"
                      >
                        + Add New Slide
                      </Button>
                    </div>
                  </FormSection>
                  
                  {/* Services Section */}
                  <FormSection title="Services & Expertise">
                    <p className={`${typography.body.small} ${colors.text.secondary} mb-4`}>
                      Manage the services and expertise cards shown on your homepage.
                    </p>
                    
                    {(homeContent.services || []).map((service, index) => (
                      <div key={`service-${typeof service.id !== 'undefined' && service.id !== null && service.id !== '' ? service.id : index}`} className="mb-6 p-4 border border-white/10 rounded-lg bg-black/20">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-white">{service.title}</h4>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeService(index)}
                            aria-label="Remove service"
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          <FormInput
                            id={`service-${index}-id`}
                            label="Service ID"
                            defaultValue={service.id}
                            placeholder="Enter service ID"
                            helpText="Used for internal reference (e.g., 'photography', 'film')"
                            onChange={(value) => updateService(index, 'id', value)}
                          />
                          
                          <FormInput
                            id={`service-${index}-title`}
                            label="Service Title"
                            defaultValue={service.title}
                            placeholder="Enter service title"
                            onChange={(value) => updateService(index, 'title', value)}
                          />
                          
                          <FormTextarea
                            id={`service-${index}-description`}
                            label="Service Description"
                            defaultValue={service.description}
                            placeholder="Enter service description"
                            rows={3}
                            onChange={(value) => updateService(index, 'description', value)}
                          />
                          
                          <FormInput
                            id={`service-${index}-icon`}
                            label="Service Icon"
                            defaultValue={service.icon}
                            placeholder="Enter emoji or icon"
                            helpText="Use an emoji as an icon (e.g., 📸, 🎬)"
                            onChange={(value) => updateService(index, 'icon', value)}
                          />
                          
                          <FormInput
                            id={`service-${index}-gradient`}
                            label="Color Gradient"
                            defaultValue={service.gradient}
                            placeholder="e.g., from-blue-500 to-purple-500"
                            helpText="Tailwind CSS gradient classes for card styling"
                            onChange={(value) => updateService(index, 'gradient', value)}
                          />
                          
                          <div className="border-t border-white/10 pt-4 mt-4">
                            <h5 className="font-medium text-sm text-white mb-4">Service Details</h5>
                            
                            {service.details.map((detail, detailIndex) => (
                              <div key={`service-detail-${index}-${detailIndex}`} className="flex gap-2 mb-2">
                                <FormInput
                                  id={`service-${index}-detail-${detailIndex}`}
                                  label={`Detail ${detailIndex + 1}`}
                                  defaultValue={detail || ""}
                                  className="flex-1"
                                  onChange={(value) => updateServiceDetail(index, detailIndex, value)}
                                />
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="mt-6"
                                  onClick={() => removeServiceDetail(index, detailIndex)}
                                  aria-label="Remove detail"
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addServiceDetail(index)}
                              className="mt-2"
                            >
                              + Add Detail
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4">
                      <Button
                        variant="secondary"
                        onClick={addService}
                        className="w-full"
                      >
                        + Add New Service
                      </Button>
                    </div>
                  </FormSection>
                  
                  {/* Portfolio Section */}
                  <FormSection title="Portfolio Display Settings">
                    <FormInput
                      id="portfolioTitle"
                      label="Section Title"
                      defaultValue={homeContent.portfolio?.title}
                      placeholder="Enter portfolio section title"
                      onChange={(value) => {
                        setHomeContent(prev => ({
                          ...prev,
                          portfolio: {
                            ...prev.portfolio,
                            title: value
                          }
                        }));
                      }}
                    />
                    
                    <FormTextarea
                      id="portfolioDescription"
                      label="Section Description"
                      defaultValue={homeContent.portfolio?.description}
                      placeholder="Enter portfolio section description"
                      rows={2}
                      onChange={(value) => {
                        setHomeContent(prev => ({
                          ...prev,
                          portfolio: {
                            ...prev.portfolio,
                            description: value
                          }
                        }));
                      }}
                    />
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-white mb-2">
                        Featured Category
                      </label>
                      <select 
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50"
                        value={homeContent.portfolio?.featuredCategory || 'all'}
                        onChange={(e) => {
                          setHomeContent(prev => ({
                            ...prev,
                            portfolio: {
                              ...prev.portfolio,
                              featuredCategory: e.target.value
                            }
                          }));
                        }}
                        aria-label="Featured Category"
                      >
                        <option value="all">All Categories</option>
                        <option value="photography">Photography</option>
                        <option value="film">Film</option>
                        <option value="webdev">Web Development</option>
                        <option value="nfts">NFTs</option>
                        <option value="dance">Dance</option>
                      </select>
                      <p className={`mt-1 text-xs ${colors.text.secondary}`}>
                        Default category to show in the portfolio section
                      </p>
                    </div>
                  </FormSection>
                  
                  <div className="flex justify-end gap-4 mt-6">
                    <Button 
                      variant="ghost" 
                      onClick={() => setHomeContent({
                        hero: {
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
                            },
                            {
                              id: 4,
                              image: '/images/hero/dance.jpg',
                              alt: 'Dance Performance',
                              category: 'Dance'
                            },
                            {
                              id: 5,
                              image: '/images/hero/nft.jpg',
                              alt: 'NFT Collection',
                              category: 'NFTs'
                            }
                          ]
                        },
                        services: [
                          {
                            id: 'photography',
                            title: 'Photography',
                            description: 'Capturing moments through the lens with artistic vision and technical precision.',
                            icon: '📸',
                            gradient: 'from-blue-500 to-purple-500',
                            details: [
                              'Portrait Photography',
                              'Event Coverage',
                              'Fine Art Photography'
                            ]
                          },
                          {
                            id: 'film',
                            title: 'Film',
                            description: 'Creating compelling visual stories through cinematography and editing.',
                            icon: '🎬',
                            gradient: 'from-purple-500 to-pink-500',
                            details: [
                              'Short Films',
                              'Documentaries',
                              'Music Videos'
                            ]
                          }
                        ],
                        portfolio: {
                          title: 'Featured Work',
                          description: 'Browse through my latest projects and creations',
                          featuredCategory: 'all'
                        }
                      })}
                    >
                      Reset
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary"
                      loading={isSaving}
                      disabled={isSaving}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
      
      case 'about':
        return (
          <div className="p-6">
            <h3 className={`${typography.heading.h3} mb-4 ${colors.text.primary}`}>About Page Content</h3>
            <p className={`${typography.body.base} ${colors.text.secondary} mb-6`}>
              Manage your biography, skills, and experience.
            </p>
            
            {formStatus && (
              <StatusMessage
                type={formStatus.type}
                message={formStatus.message}
                onDismiss={() => setFormStatus(null)}
              />
            )}
            
            <div className="lg:flex lg:gap-8">
              <div className="lg:flex-1">
                <form onSubmit={handleAboutFormSubmit}>
                  <FormSection title="Biography">
                    <FormTextarea
                      id={`biography-content-${aboutContent.biography?.content ? 'edit' : 'new'}`}
                      label="Full Biography"
                      defaultValue={aboutContent.biography?.content || ""}
                      placeholder="Tell your story..."
                      required
                      validate={validators.compose(
                        validators.required,
                        validators.minLength(50)
                      )}
                      helpText="Share your background, experience, and journey (min 50 characters)"
                      rows={8}
                      maxLength={5000}
                      onChange={(value) => updateAboutContent('biography', 'content', value)}
                    />
                    
                    <FormInput
                      id={`biography-image-${aboutContent.biography?.image ? 'edit' : 'new'}`}
                      label="Biography Image URL"
                      defaultValue={aboutContent.biography?.image || ""}
                      placeholder="Enter image URL"
                      type="url"
                      validate={validators.url}
                      helpText="Add an image to accompany your biography"
                      onChange={(value) => updateAboutContent('biography', 'image', value)}
                    />
                  </FormSection>
                  
                  {/* Skills Section */}
                  <FormSection title="Skills & Expertise">
                    <p className={`${typography.body.small} ${colors.text.secondary} mb-4`}>
                      Add your skills and areas of expertise to display on the About page.
                    </p>
                    
                    <div className="space-y-3">
                      {(aboutContent.skills || []).map((skill, index) => (
                        <div key={`skill-${index}`} className="flex items-center gap-2">
                          <FormInput
                            id={`skill-${index}-${skill ? 'edit' : 'new'}`}
                            label={`Skill ${index + 1}`}
                            defaultValue={skill || ""}
                            className="flex-1"
                            onChange={(value) => {
                              setAboutContent(prev => {
                                const updatedSkills = [...(prev.skills || [])];
                                updatedSkills[index] = value;
                                return {
                                  ...prev,
                                  skills: updatedSkills
                                };
                              });
                            }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="mt-6"
                            onClick={() => {
                              setAboutContent(prev => {
                                const updatedSkills = [...(prev.skills || [])];
                                updatedSkills.splice(index, 1);
                                return {
                                  ...prev,
                                  skills: updatedSkills
                                };
                              });
                            }}
                            aria-label="Remove skill"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setAboutContent(prev => ({
                            ...prev,
                            skills: [...(prev.skills || []), `New Skill`]
                          }));
                        }}
                      >
                        + Add Skill
                      </Button>
                    </div>
                  </FormSection>
                  
                  {/* Milestones Section */}
                  <FormSection title="Milestones">
                    <p className={`${typography.body.small} ${colors.text.secondary} mb-4`}>
                      Add your milestones and achievements to display on the About page.
                    </p>
                    
                    {(aboutContent.milestones || []).map((milestone, index) => (
                      <div key={`milestone-${typeof milestone.id !== 'undefined' && milestone.id !== null ? milestone.id : index}`} className="mb-6 p-4 border border-white/10 rounded-lg bg-black/20">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-white">{milestone.title || `Milestone ${index + 1}`}</h4>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setAboutContent(prev => {
                                const updatedMilestones = [...(prev.milestones || [])];
                                updatedMilestones.splice(index, 1);
                                return {
                                  ...prev,
                                  milestones: updatedMilestones
                                };
                              });
                            }}
                            aria-label="Remove milestone"
                          >
                            ×
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          <FormInput
                            id={`milestone-${index}-year-${milestone.year ? 'edit' : 'new'}`}
                            label="Year"
                            defaultValue={milestone.year || ""}
                            placeholder="Enter year"
                            onChange={(value) => {
                              setAboutContent(prev => {
                                const updatedMilestones = [...(prev.milestones || [])];
                                updatedMilestones[index] = {
                                  ...updatedMilestones[index],
                                  year: value
                                };
                                return {
                                  ...prev,
                                  milestones: updatedMilestones
                                };
                              });
                            }}
                          />
                          
                          <FormInput
                            id={`milestone-${index}-title-${milestone.title ? 'edit' : 'new'}`}
                            label="Title"
                            defaultValue={milestone.title || ""}
                            placeholder="Enter title"
                            onChange={(value) => {
                              setAboutContent(prev => {
                                const updatedMilestones = [...(prev.milestones || [])];
                                updatedMilestones[index] = {
                                  ...updatedMilestones[index],
                                  title: value
                                };
                                return {
                                  ...prev,
                                  milestones: updatedMilestones
                                };
                              });
                            }}
                          />
                          
                          <FormTextarea
                            id={`milestone-${index}-description-${milestone.description ? 'edit' : 'new'}`}
                            label="Description"
                            defaultValue={milestone.description || ""}
                            placeholder="Enter description"
                            rows={3}
                            onChange={(value) => {
                              setAboutContent(prev => {
                                const updatedMilestones = [...(prev.milestones || [])];
                                updatedMilestones[index] = {
                                  ...updatedMilestones[index],
                                  description: value
                                };
                                return {
                                  ...prev,
                                  milestones: updatedMilestones
                                };
                              });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setAboutContent(prev => ({
                            ...prev,
                            milestones: [...(prev.milestones || []), {
                              id: Date.now(),
                              year: '',
                              title: 'New Milestone',
                              description: '',
                              icon: '📅'
                            }]
                          }));
                        }}
                      >
                        + Add Milestone
                      </Button>
                    </div>
                  </FormSection>
                  
                  {/* Featured Work Section */}
                  <FormSection title="Featured Work">
                    <p className={`${typography.body.small} ${colors.text.secondary} mb-4`}>
                      Add your featured work to display on the About page.
                    </p>
                    
                    {(aboutContent.featuredWork || []).map((item, index) => (
                      <div key={`featured-work-${typeof item.id !== 'undefined' && item.id !== null ? item.id : index}`} className="relative group border border-white/10 rounded-lg overflow-hidden bg-black/30">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAboutContent(prev => {
                                const updatedWork = [...(prev.featuredWork || [])];
                                updatedWork.splice(index, 1);
                                return {
                                  ...prev,
                                  featuredWork: updatedWork
                                };
                              });
                            }}
                            aria-label="Remove work"
                          >
                            ×
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          <FormInput
                            id={`work-${index}-image-${item.image ? 'edit' : 'new'}`}
                            label="Image URL"
                            defaultValue={item.image || ""}
                            placeholder="Enter image URL"
                            type="url"
                            validate={validators.url}
                            onChange={(value) => {
                              setAboutContent(prev => {
                                const updatedWork = [...(prev.featuredWork || [])];
                                updatedWork[index] = {
                                  ...updatedWork[index],
                                  image: value
                                };
                                return {
                                  ...prev,
                                  featuredWork: updatedWork
                                };
                              });
                            }}
                          />
                          
                          <FormInput
                            id={`work-${index}-title-${item.title ? 'edit' : 'new'}`}
                            label="Title"
                            defaultValue={item.title || ""}
                            placeholder="Enter title"
                            onChange={(value) => {
                              setAboutContent(prev => {
                                const updatedWork = [...(prev.featuredWork || [])];
                                updatedWork[index] = {
                                  ...updatedWork[index],
                                  title: value
                                };
                                return {
                                  ...prev,
                                  featuredWork: updatedWork
                                };
                              });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setAboutContent(prev => ({
                            ...prev,
                            featuredWork: [...(prev.featuredWork || []), {
                              id: Date.now(),
                              image: '',
                              title: ''
                            }]
                          }));
                        }}
                      >
                        + Add Work
                      </Button>
                    </div>
                  </FormSection>
                </form>
              </div>
            </div>
          </div>
        );
      
      case 'contact':
        return (
          <div className="p-6">
            <h3 className={`${typography.heading.h3} mb-4 ${colors.text.primary}`}>Contact Page Content</h3>
            <p className={`${typography.body.base} ${colors.text.secondary} mb-6`}>
              Manage your contact information and form settings.
            </p>
            
            {formStatus && (
              <StatusMessage
                type={formStatus.type}
                message={formStatus.message}
                onDismiss={() => setFormStatus(null)}
              />
            )}
            
            <div className="lg:flex lg:gap-8">
              <div className="lg:flex-1">
                <form onSubmit={handleContactFormSubmit}>
                  <FormSection title="Contact Information">
                    <FormInput
                      id="email"
                      label="Email"
                      defaultValue={contactContent.contactInfo?.email}
                      placeholder="Enter email"
                      type="email"
                      validate={validators.email}
                      required
                      onChange={(value) => updateContactContent('contactInfo', 'email', value)}
                    />
                    
                    <FormInput
                      id="phone"
                      label="Phone"
                      defaultValue={contactContent.contactInfo?.phone}
                      placeholder="Enter phone"
                      type="tel"
                      onChange={(value) => updateContactContent('contactInfo', 'phone', value)}
                    />
                    
                    <FormInput
                      id="address"
                      label="Address"
                      defaultValue={contactContent.contactInfo?.address}
                      placeholder="Enter address"
                      onChange={(value) => updateContactContent('contactInfo', 'address', value)}
                    />
                  </FormSection>
                  
                  {/* Social Media Section */}
                  <FormSection title="Social Media">
                    <FormInput
                      id="instagram"
                      label="Instagram"
                      defaultValue={contactContent.socialMedia?.instagram}
                      placeholder="Enter Instagram URL"
                      type="url"
                      validate={validators.url}
                      onChange={(value) => updateContactContent('socialMedia', 'instagram', value)}
                    />
                    
                    <FormInput
                      id="twitter"
                      label="Twitter"
                      defaultValue={contactContent.socialMedia?.twitter}
                      placeholder="Enter Twitter URL"
                      type="url"
                      validate={validators.url}
                      onChange={(value) => updateContactContent('socialMedia', 'twitter', value)}
                    />
                    
                    <FormInput
                      id="linkedin"
                      label="LinkedIn"
                      defaultValue={contactContent.socialMedia?.linkedin}
                      placeholder="Enter LinkedIn URL"
                      type="url"
                      validate={validators.url}
                      onChange={(value) => updateContactContent('socialMedia', 'linkedin', value)}
                    />
                    
                    <FormInput
                      id="github"
                      label="GitHub"
                      defaultValue={contactContent.socialMedia?.github}
                      placeholder="Enter GitHub URL"
                      type="url"
                      validate={validators.url}
                      onChange={(value) => updateContactContent('socialMedia', 'github', value)}
                    />
                  </FormSection>
                  
                  {/* Location Section */}
                  <FormSection title="Location">
                    <FormInput
                      id="city"
                      label="City"
                      defaultValue={contactContent.location?.city}
                      placeholder="Enter city"
                      onChange={(value) => updateContactContent('location', 'city', value)}
                    />
                    
                    <FormInput
                      id="country"
                      label="Country"
                      defaultValue={contactContent.location?.country}
                      placeholder="Enter country"
                      onChange={(value) => updateContactContent('location', 'country', value)}
                    />
                    
                    <FormToggle
                      id="showMap"
                      label="Show Map"
                      checked={contactContent.location?.showMap}
                      onChange={(value) => updateContactContent('location', 'showMap', value.toString())}
                    />
                  </FormSection>
                  
                  {/* Map Coordinates Section */}
                  <FormSection title="Map Coordinates">
                    <FormInput
                      id="latitude"
                      label="Latitude"
                      defaultValue={contactContent.location?.mapCoordinates?.lat?.toString() || ""}
                      placeholder="Enter latitude"
                      type="number"
                      onChange={(value) => {
                        setContactContent(prev => {
                          const updatedCoordinates = {
                            ...prev.location?.mapCoordinates,
                            lat: parseFloat(value)
                          };
                          return {
                            ...prev,
                            location: {
                              ...prev.location,
                              mapCoordinates: updatedCoordinates
                            }
                          };
                        });
                      }}
                    />
                    
                    <FormInput
                      id="longitude"
                      label="Longitude"
                      defaultValue={contactContent.location?.mapCoordinates?.lng?.toString() || ""}
                      placeholder="Enter longitude"
                      type="number"
                      onChange={(value) => {
                        setContactContent(prev => {
                          const updatedCoordinates = {
                            ...prev.location?.mapCoordinates,
                            lng: parseFloat(value)
                          };
                          return {
                            ...prev,
                            location: {
                              ...prev.location,
                              mapCoordinates: updatedCoordinates
                            }
                          };
                        });
                      }}
                    />
                  </FormSection>
                  
                  {/* Form Settings Section */}
                  <FormSection title="Form Settings">
                    <FormToggle
                      id="enabled"
                      label="Enable Contact Form"
                      checked={contactContent.formSettings?.enabled}
                      onChange={(value) => updateContactContent('formSettings', 'enabled', value.toString())}
                    />
                    
                    <FormInput
                      id="title"
                      label="Form Title"
                      defaultValue={contactContent.formSettings?.title}
                      placeholder="Enter form title"
                      onChange={(value) => updateContactContent('formSettings', 'title', value)}
                    />
                    
                    <FormTextarea
                      id="description"
                      label="Form Description"
                      defaultValue={contactContent.formSettings?.description}
                      placeholder="Enter form description"
                      rows={3}
                      onChange={(value) => updateContactContent('formSettings', 'description', value)}
                    />
                    
                    <FormInput
                      id="confirmationMessage"
                      label="Confirmation Message"
                      defaultValue={contactContent.formSettings?.confirmationMessage}
                      placeholder="Enter confirmation message"
                      onChange={(value) => updateContactContent('formSettings', 'confirmationMessage', value)}
                    />
                  </FormSection>
                  
                  {/* Dance Styles Section */}
                  <FormSection title="Dance Styles">
                    <p className={`${typography.body.small} ${colors.text.secondary} mb-4`}>
                      Select the dance styles you specialize in.
                    </p>
                    
                    <div className="space-y-3">
                      {(contactContent.formSettings?.danceStyles?.options || []).map((style, index) => (
                        <div key={`style-${index}`} className="flex items-center gap-2">
                          <FormToggle
                            id={`style-${index}-enabled`}
                            label={style}
                            checked={contactContent.formSettings?.danceStyles?.enabled}
                            onChange={(value) => {
                              setContactContent(prev => {
                                const updatedStyles = {
                                  ...prev.formSettings?.danceStyles,
                                  enabled: value
                                };
                                return {
                                  ...prev,
                                  formSettings: {
                                    ...prev.formSettings,
                                    danceStyles: updatedStyles
                                  }
                                };
                              });
                            }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="mt-6"
                            onClick={() => {
                              setContactContent(prev => {
                                const updatedStyles = {
                                  ...prev.formSettings?.danceStyles,
                                  options: prev.formSettings?.danceStyles?.options?.filter(s => s !== style)
                                };
                                return {
                                  ...prev,
                                  formSettings: {
                                    ...prev.formSettings,
                                    danceStyles: updatedStyles
                                  }
                                };
                              });
                            }}
                            aria-label="Remove style"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setContactContent(prev => ({
                            ...prev,
                            formSettings: {
                              ...prev.formSettings,
                              danceStyles: {
                                ...prev.formSettings?.danceStyles,
                                options: [...(prev.formSettings?.danceStyles?.options || []), `New Style ${(prev.formSettings?.danceStyles?.options || []).length + 1}`]
                              }
                            }
                          }));
                        }}
                      >
                        + Add Style
                      </Button>
                    </div>
                  </FormSection>
                  
                  {/* FAQ Section */}
                  <FormSection title="FAQs">
                    <p className={`${typography.body.small} ${colors.text.secondary} mb-4`}>
                      Add or manage FAQs for the contact page.
                    </p>
                    
                    {(contactContent.faqs || []).map((faq, index) => (
                      <div key={`faq-item-${index}`} className="border border-white/10 p-4 rounded-md mb-4 bg-black/20">
                        <FormInput
                          id={`faq-question-${index}`}
                          label="Question"
                          defaultValue={faq.question || ""}
                          placeholder="What's the typical response time?"
                          onChange={(value) => {
                            const updatedFaqs = [...(contactContent.faqs || [])];
                            updatedFaqs[index] = { ...updatedFaqs[index], question: value };
                            setContactContent({
                              ...contactContent,
                              faqs: updatedFaqs,
                            });
                          }}
                        />
                        <FormTextarea
                          id={`faq-answer-${index}`}
                          label="Answer"
                          defaultValue={faq.answer || ""}
                          placeholder="I aim to respond to all inquiries within 24-48 hours during business days."
                          rows={3}
                          onChange={(value) => {
                            const updatedFaqs = [...(contactContent.faqs || [])];
                            updatedFaqs[index] = { ...updatedFaqs[index], answer: value };
                            setContactContent({
                              ...contactContent,
                              faqs: updatedFaqs,
                            });
                          }}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            const updatedFaqs = [...(contactContent.faqs || [])];
                            updatedFaqs.splice(index, 1);
                            setContactContent({
                              ...contactContent,
                              faqs: updatedFaqs,
                            });
                          }}
                          className="mt-2"
                        >
                          Remove FAQ
                        </Button>
                      </div>
                    ))}
                  </FormSection>

                  {/* Add the "Add FAQ" button */}
                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setContactContent({
                          ...contactContent,
                          faqs: [...(contactContent.faqs || []), { 
                            question: `FAQ Question ${(contactContent.faqs || []).length + 1}`, 
                            answer: 'Enter answer here' 
                          }],
                        });
                      }}
                      className="w-full"
                    >
                      + Add FAQ
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs navigation */}
      <GlassPanel intensity="medium" className="p-4">
        <div className="flex flex-wrap gap-3 p-1 overflow-x-auto">
          {pageContentTabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-3 rounded-lg inline-flex items-center gap-2 transition-all duration-300 font-medium min-w-[140px] justify-center ${
                activeTab === tab.id
                  ? `bg-gradient-to-r from-blue-500 to-purple-500 text-white ${shadows.glow.blue}`
                  : 'bg-white/10 text-gray-200 hover:bg-white/20'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </GlassPanel>

      {/* Tab description */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-1"
      >
        <p className={`${typography.body.base} ${colors.text.secondary}`}>
          {pageContentTabs.find(tab => tab.id === activeTab)?.description || 'Select a tab to edit content'}
        </p>
      </motion.div>

      {/* Tab content */}
      <GlassPanel intensity="medium" gradientBorder={true} className="backdrop-blur-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </GlassPanel>
    </div>
  );
}