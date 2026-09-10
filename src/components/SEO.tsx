import { useEffect } from 'react';

const canonicalOrigin = 'https://upserve.in';
const fallbackImage = `${canonicalOrigin}/logo.png`;

export const publicSeo = {
  home: {
    title: 'Upserve | Software Development Agency',
    description: 'Upserve is a software development agency building websites, apps, custom software and AI tools — from first requirement to delivery.',
  },
  services: {
    title: 'Services | Software, Web, App & AI Development | Upserve',
    description: "Websites, mobile apps, custom software, AI agents and automation — see what Upserve builds and what's included in each engagement.",
  },
  portfolio: {
    title: 'Our Work | Upserve',
    description: 'Digital products and software Upserve has built, from first requirement to delivery.',
  },
  showcase: {
    title: 'Platform Showcase | How Upserve Runs Projects',
    description: 'A look at the internal platform Upserve uses to manage requirements, delivery and communication on every project.',
  },
  about: {
    title: 'About Upserve | Software Development Agency',
    description: 'Meet the team behind Upserve and how we approach software, digital products and delivery.',
  },
  blogs: {
    title: 'Insights | Upserve',
    description: 'Practical perspectives on digital products, technology and building better experiences.',
  },
  contact: {
    title: 'Contact Upserve | Start a Project',
    description: 'Tell Upserve about your project. Get in touch to start building your website, app or software.',
  },
} as const;

interface SEOProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  indexable?: boolean;
}

function canonicalUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${canonicalOrigin}${normalizedPath || '/'}`;
}

function publicImageUrl(image?: string) {
  if (!image) return fallbackImage;
  try {
    const url = new URL(image, canonicalOrigin);
    return url.protocol === 'https:' ? url.href : fallbackImage;
  } catch {
    return fallbackImage;
  }
}

function setMeta(attribute: 'name' | 'property', value: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[data-upserve-seo="true"][${attribute}="${value}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.dataset.upserveSeo = 'true';
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function SEO({ title, description = '', path, image, type = 'website', indexable = true }: SEOProps) {
  useSEO({ title, description, path, image, type, indexable });
  return null;
}

export function useSEO({ title, description = '', path, image, type = 'website', indexable = true }: SEOProps) {
  useEffect(() => {
    const url = canonicalUrl(path ?? window.location.pathname);
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', indexable ? 'index,follow' : 'noindex,nofollow');
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:site_name', 'Upserve');
    setMeta('property', 'og:image', publicImageUrl(image));
    setMeta('property', 'og:image:alt', 'Upserve');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', publicImageUrl(image));

    let canonical = document.head.querySelector<HTMLLinkElement>('link[data-upserve-seo="true"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.dataset.upserveSeo = 'true';
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [description, image, indexable, path, title, type]);
}

export function publicImage(image?: string) {
  return publicImageUrl(image);
}