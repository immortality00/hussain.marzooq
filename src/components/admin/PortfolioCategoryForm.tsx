'use client';

import { useState, useEffect } from 'react';
import { PortfolioCategory } from '@/types/portfolio';
import { 
  PortfolioPageContent,
  getPageContent,
  updatePageContent,
  getDefaultPageContent
} from '@/lib/api/pageContentService';
import { 
  FormInput, 
  FormTextarea, 
  FormSection, 
  Button, 
  StatusMessage
} from './ui/FormComponents';
import { typography, colors } from './designSystem';
import { uploadContentImage } from '@/lib/api/pageContentService';

interface PortfolioCategoryFormProps {
  category: PortfolioCategory;
}

export default function PortfolioCategoryForm({ category }: PortfolioCategoryFormProps) {
  const [content, setContent] = useState<Partial<PortfolioPageContent>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error'; message: string; } | null>(null);
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing page content
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const pageContent = await getPageContent(category);
        if (pageContent && pageContent.content) {
          setContent(pageContent.content as Partial<PortfolioPageContent>);
        } else {
          // Use default content if none exists
          const defaultContent = getDefaultPageContent(category) as Partial<PortfolioPageContent>;
          setContent(defaultContent);
        }
      } catch (error) {
        console.error(`Error loading ${category} page content:`, error);
        setFormStatus({
          type: 'error',
          message: `Failed to load ${category} page content. Please try again later.`
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [category]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormStatus(null);
    setErrors({});

    // Validate required fields before submitting
    const newErrors: Record<string, string> = {};
    
    if (!content.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Check for other required fields
    if (!content.hero?.title?.trim()) {
      newErrors['hero-title'] = 'Title is required';
    }
    
    if (!content.hero?.subtitle?.trim()) {
      newErrors['hero-subtitle'] = 'Subtitle is required';
    }
    
    // If we have errors, stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormStatus({ 
        type: 'error', 
        message: 'Please fill in all required fields.' 
      });
      setIsSaving(false);
      return;
    }

    try {
      // Upload hero image if selected
      if (heroImage) {
        const imageUrl = await uploadContentImage(category, 'hero', heroImage);
        if (imageUrl) {
          setContent(prev => {
            // Create a deep copy to avoid type issues
            const newContent = { ...prev };
            if (newContent.hero) {
              newContent.hero = { 
                ...newContent.hero,
                backgroundImage: imageUrl
              };
            } else {
              newContent.hero = {
                title: '',
                subtitle: '',
                backgroundImage: imageUrl
              };
            }
            return newContent;
          });
        }
      }

      // Ensure category field is set correctly and description is not empty
      const updatedContent = {
        ...content,
        category,
        description: content.description?.trim() || ''
      };

      const result = await updatePageContent(category, updatedContent);
      if (result) {
        setFormStatus({ 
          type: 'success', 
          message: `${category.charAt(0).toUpperCase() + category.slice(1)} page content saved successfully! Content on the live site will be updated.` 
        });
        
        // Add a slight delay before triggering a preview refresh
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('content-updated', { 
              detail: { pageName: category } 
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
        message: `Failed to save ${category} page content: ${errorMessage}` 
      });
      console.error(`Error saving ${category} page content:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper for updating content fields
  const updateContentField = (field: string, subfield: string, value: string | number | boolean) => {
    setContent(prev => {
      const newContent = { ...prev };
      if (!newContent[field as keyof PortfolioPageContent]) {
        (newContent as any)[field] = {};
      }
      ((newContent as any)[field] as any)[subfield] = value;
      return newContent;
    });
  };

  // Handle file input change for hero background
  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroImage(e.target.files[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300/10 rounded w-1/3"></div>
          <div className="h-32 bg-gray-300/10 rounded"></div>
          <div className="h-8 bg-gray-300/10 rounded w-1/2"></div>
          <div className="h-24 bg-gray-300/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="py-6 px-4 md:px-6 space-y-8">
      {formStatus && (
        <StatusMessage 
          type={formStatus.type} 
          message={formStatus.message} 
          onDismiss={() => setFormStatus(null)} 
        />
      )}

      {/* Hero Section */}
      <FormSection title="Hero Section">
        <p className={`${typography.body.small} ${colors.text.secondary} mb-4`}>
          The hero section appears at the top of your {category} portfolio page and sets the tone for visitors.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <FormInput
            label="Title"
            id="hero-title"
            value={content.hero?.title || ''}
            onChange={(e) => updateContentField('hero', 'title', e.target.value)}
            placeholder={`Enter title for ${category} page`}
            required
            error={errors['hero-title']}
          />
          <FormInput
            label="Subtitle"
            id="hero-subtitle"
            value={content.hero?.subtitle || ''}
            onChange={(e) => updateContentField('hero', 'subtitle', e.target.value)}
            placeholder="Enter a brief subtitle or tagline"
            required
            error={errors['hero-subtitle']}
          />
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Background Image
          </label>
          <div className="flex items-start space-x-4">
            {content.hero?.backgroundImage && (
              <div className="w-32 h-20 rounded overflow-hidden bg-black/20">
                <img
                  src={content.hero.backgroundImage}
                  alt="Hero background"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroImageChange}
                className="block w-full text-sm text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50/10 file:text-blue-300
                  hover:file:bg-blue-100/20"
                aria-label="Upload hero background image"
              />
              <p className="mt-1 text-xs text-gray-400">
                Recommended size: 1600×800 pixels
              </p>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Description Section */}
      <FormSection title="Category Description">
        <p className={`${typography.body.small} ${colors.text.secondary} mb-4`}>
          Provide a compelling description of your {category} work. This will appear at the top of the portfolio page.
        </p>
        <FormTextarea
          label="Description"
          id="description"
          value={content.description || ''}
          onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
          placeholder={`Describe your ${category} work and expertise...`}
          rows={5}
          required
          error={errors.description}
        />
      </FormSection>

      {/* Featured Projects Section */}
      <FormSection title="Featured Projects">
        <p className={`${typography.body.small} ${colors.text.secondary} mb-4`}>
          Configure how featured projects are displayed on your {category} page.
        </p>
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="featured-enabled"
              checked={content.featuredProjects?.enabled || false}
              onChange={(e) => updateContentField('featuredProjects', 'enabled', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="featured-enabled" className="text-sm font-medium text-gray-300">
              Show Featured Projects
            </label>
          </div>
          
          {content.featuredProjects?.enabled && (
            <div>
              <label htmlFor="featured-count" className="block text-sm font-medium text-gray-300 mb-2">
                Number of Featured Projects
              </label>
              <input
                type="number"
                id="featured-count"
                value={content.featuredProjects?.count || 3}
                onChange={(e) => updateContentField('featuredProjects', 'count', parseInt(e.target.value))}
                min={1}
                max={6}
                className="block w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-white"
              />
              <p className="mt-1 text-xs text-gray-400">
                How many projects to display in the featured section
              </p>
            </div>
          )}
        </div>
      </FormSection>

      {/* Layout Settings */}
      <FormSection title="Layout Settings">
        <p className={`${typography.body.small} ${colors.text.secondary} mb-4`}>
          Customize how your {category} portfolio items are displayed.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="layout-columns" className="block text-sm font-medium text-gray-300 mb-2">
              Grid Columns
            </label>
            <select
              id="layout-columns"
              value={content.layout?.columns?.toString() || '3'}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                updateContentField('layout', 'columns', value as 2 | 3 | 4);
              }}
              className="block w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-white"
            >
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Number of columns in the project grid
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="layout-filters"
                checked={content.layout?.showFilters || false}
                onChange={(e) => updateContentField('layout', 'showFilters', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="layout-filters" className="text-sm font-medium text-gray-300">
                Show Filters
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="layout-tags"
                checked={content.layout?.showTags || false}
                onChange={(e) => updateContentField('layout', 'showTags', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="layout-tags" className="text-sm font-medium text-gray-300">
                Show Tags
              </label>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Advanced Layout Options */}
      <FormSection title="Advanced Layout Options">
        <p className={`${typography.body.small} ${colors.text.secondary} mb-4`}>
          Fine-tune the appearance and behavior of your {category} portfolio.
        </p>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="animation-style" className="block text-sm font-medium text-gray-300 mb-2">
              Animation Style
            </label>
            <select
              id="animation-style"
              value={content.layout?.animationStyle || 'fade'}
              onChange={(e) => updateContentField('layout', 'animationStyle', e.target.value)}
              className="block w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-white"
            >
              <option value="fade">Fade In</option>
              <option value="slide">Slide Up</option>
              <option value="scale">Scale Up</option>
              <option value="none">No Animation</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">
              How items appear when scrolled into view
            </p>
          </div>
          
          <div>
            <label htmlFor="spacing" className="block text-sm font-medium text-gray-300 mb-2">
              Item Spacing
            </label>
            <select
              id="spacing"
              value={content.layout?.spacing || 'medium'}
              onChange={(e) => updateContentField('layout', 'spacing', e.target.value)}
              className="block w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-white"
            >
              <option value="tight">Tight</option>
              <option value="medium">Medium</option>
              <option value="relaxed">Relaxed</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Space between portfolio items
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <label htmlFor="card-style" className="block text-sm font-medium text-gray-300 mb-2">
            Card Style
          </label>
          <select
            id="card-style"
            value={content.layout?.cardStyle || 'standard'}
            onChange={(e) => updateContentField('layout', 'cardStyle', e.target.value)}
            className="block w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-white"
          >
            <option value="standard">Standard</option>
            <option value="minimal">Minimal</option>
            <option value="bordered">Bordered</option>
            <option value="glass">Glass Effect</option>
          </select>
          <p className="mt-1 text-xs text-gray-400">
            Visual style for portfolio item cards
          </p>
        </div>
        
        <div className="mt-6 flex items-center space-x-3">
          <input
            type="checkbox"
            id="hover-effect"
            checked={content.layout?.hoverEffect || false}
            onChange={(e) => updateContentField('layout', 'hoverEffect', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          <label htmlFor="hover-effect" className="text-sm font-medium text-gray-300">
            Enable Hover Effects
          </label>
        </div>
      </FormSection>

      {/* SEO Settings */}
      <FormSection title="SEO Settings">
        <p className={`${typography.body.small} ${colors.text.secondary} mb-4`}>
          Optimize your {category} page for search engines.
        </p>
        <div className="space-y-6">
          <FormInput
            label="SEO Title"
            id="seo-title"
            value={content.seo?.title || ''}
            onChange={(e) => updateContentField('seo', 'title', e.target.value)}
            placeholder={`${category.charAt(0).toUpperCase() + category.slice(1)} Portfolio - Your Name`}
          />
          
          <FormTextarea
            label="SEO Description"
            id="seo-description"
            value={content.seo?.description || ''}
            onChange={(e) => updateContentField('seo', 'description', e.target.value)}
            placeholder={`Explore my ${category} portfolio showcasing...`}
            rows={3}
            maxLength={160}
          />
          
          <FormInput
            label="Keywords (comma separated)"
            id="seo-keywords"
            value={content.seo?.keywords?.join(', ') || ''}
            onChange={(e) => {
              const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
              updateContentField('seo', 'keywords', keywords as any);
            }}
            placeholder={`${category}, portfolio, projects, your name`}
          />
        </div>
      </FormSection>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSaving}
          loading={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
} 