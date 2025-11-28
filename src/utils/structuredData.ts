// Structured data helpers for SEO

export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Polariz",
  "url": "https://polariz.ai",
  "logo": "https://polariz.ai/lovable-uploads/polariz_icon.png",
  "description": "AI-powered speech therapy platform for children with special needs",
  "sameAs": [
    // Add social media links when available
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "support@polariz.ai" // Update with actual email
  }
});

export const getWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Polariz",
  "url": "https://polariz.ai",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://polariz.ai/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
});

export const getServiceSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Speech Therapy",
  "provider": {
    "@type": "Organization",
    "name": "Polariz"
  },
  "areaServed": "Worldwide",
  "description": "AI-powered speech therapy services for children with special needs"
});

export const getPersonSchema = (name: string, jobTitle: string, image: string, linkedIn?: string) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": name,
  "jobTitle": jobTitle,
  "image": `https://polariz.ai${image}`,
  ...(linkedIn && {
    "sameAs": [linkedIn]
  })
});

