import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  canonical?: string;
  noindex?: boolean;
  structuredData?: object;
}

const defaultTitle = 'Polariz - AI-Powered Speech Therapy for Children';
const defaultDescription = 'Transform your home into a learning hub with AI speech therapists. Personalized speech therapy sessions designed for children with special needs.';
const defaultImage = '/lovable-uploads/FrontPage1.jpg';
const siteUrl = 'https://polariz.ai'; // Update with your actual domain

export const SEO = ({
  title = defaultTitle,
  description = defaultDescription,
  image = defaultImage,
  url,
  type = 'website',
  canonical,
  noindex = false,
  structuredData,
}: SEOProps) => {
  const location = useLocation();
  const currentUrl = url || `${siteUrl}${location.pathname}`;
  const canonicalUrl = canonical || currentUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    
    // OpenGraph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', fullImageUrl, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Polariz', true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', fullImageUrl);
    
    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Structured data
    if (structuredData) {
      let scriptTag = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, image, currentUrl, canonicalUrl, fullImageUrl, type, noindex, structuredData]);

  return null;
};

