import { useEffect } from "react";

const canonicalOrigin = "https://upserve.in";
const fallbackImage = `${canonicalOrigin}/logo.png`;
const organizationId = `${canonicalOrigin}/#organization`;
const websiteId = `${canonicalOrigin}/#website`;
const socialProfiles = [
  "https://www.linkedin.com/in/tnmy4903/",
  "https://www.instagram.com/tnmy4903/",
  "https://github.com/tnmy4903/",
];

type SchemaValue = Record<string, unknown> | Record<string, unknown>[];

export const publicSeo = {
  home: {
    title: "Upserve | Software Development Agency",
    description:
      "Upserve is a software development agency building websites, apps, custom software and AI tools — from first requirement to delivery.",
  },
  services: {
    title: "Services | Software, Web, App & AI Development | Upserve",
    description:
      "Websites, mobile apps, custom software, AI agents and automation — see what Upserve builds and what's included in each engagement.",
  },
  portfolio: {
    title: "Our Work | Upserve",
    description:
      "Digital products and software Upserve has built, from first requirement to delivery.",
  },
  showcase: {
    title: "Platform Showcase | How Upserve Runs Projects",
    description:
      "A look at the internal platform Upserve uses to manage requirements, delivery and communication on every project.",
  },
  about: {
    title: "About Upserve | Software Development Agency",
    description:
      "Meet the team behind Upserve and how we approach software, digital products and delivery.",
  },
  blogs: {
    title: "Insights | Upserve",
    description:
      "Practical perspectives on digital products, technology and building better experiences.",
  },
  contact: {
    title: "Contact Upserve | Start a Project",
    description:
      "Tell Upserve about your project. Get in touch to start building your website, app or software.",
  },
} as const;

interface SEOProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  indexable?: boolean;
  structuredData?: SchemaValue;
}

function canonicalUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${canonicalOrigin}${normalizedPath || "/"}`;
}

function publicImageUrl(image?: string) {
  if (!image) return fallbackImage;
  try {
    const url = new URL(image, canonicalOrigin);
    return url.protocol === "https:" ? url.href : fallbackImage;
  } catch {
    return fallbackImage;
  }
}

function setMeta(
  attribute: "name" | "property",
  value: string,
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[data-upserve-seo="true"][${attribute}="${value}"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.dataset.upserveSeo = "true";
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function SEO({
  title,
  description = "",
  path,
  image,
  type = "website",
  indexable = true,
  structuredData,
}: SEOProps) {
  useSEO({ title, description, path, image, type, indexable, structuredData });
  return null;
}

export function useSEO({
  title,
  description = "",
  path,
  image,
  type = "website",
  indexable = true,
  structuredData,
}: SEOProps) {
  const dynamicPath =
    path?.startsWith("/blogs/") || path?.startsWith("/portfolio/");
  useStructuredData(
    dynamicPath
      ? undefined
      : (structuredData ??
          (indexable ? staticPageSchema(path, title, description) : undefined)),
    !dynamicPath,
  );
  useEffect(() => {
    const url = canonicalUrl(path ?? window.location.pathname);
    document.title = title;
    setMeta("name", "description", description);
    setMeta("name", "robots", indexable ? "index,follow" : "noindex,nofollow");
    setMeta("property", "og:type", type);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:site_name", "Upserve");
    setMeta("property", "og:image", publicImageUrl(image));
    setMeta("property", "og:image:alt", "Upserve");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", publicImageUrl(image));

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[data-upserve-seo="true"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.dataset.upserveSeo = "true";
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [description, image, indexable, path, structuredData, title, type]);
}

export function useStructuredData(data?: SchemaValue, manage = true) {
  useEffect(() => {
    if (!manage) return;
    const existingSchema = document.head.querySelector<HTMLScriptElement>(
      'script[data-upserve-schema="true"]',
    );
    if (!data) {
      existingSchema?.remove();
      return;
    }
    const schema = existingSchema ?? document.createElement("script");
    schema.type = "application/ld+json";
    schema.dataset.upserveSchema = "true";
    schema.textContent = JSON.stringify(data);
    if (!existingSchema) document.head.appendChild(schema);
  }, [data, manage]);
}

export function publicImage(image?: string) {
  return publicImageUrl(image);
}

export function organizationEntity() {
  return {
    "@type": "Organization",
    "@id": organizationId,
    name: "Upserve",
    url: canonicalOrigin,
    logo: { "@type": "ImageObject", url: fallbackImage },
    sameAs: socialProfiles,
  };
}

export function websiteEntity(description: string) {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    name: "Upserve",
    url: canonicalOrigin,
    description,
    publisher: { "@id": organizationId },
  };
}

export function pageEntity({
  type = "WebPage",
  name,
  description,
  url,
  about,
  image,
}: {
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";
  name: string;
  description: string;
  url: string;
  about?: SchemaValue;
  image?: string;
}) {
  return {
    "@type": type,
    "@id": `${url}#webpage`,
    name,
    url,
    description,
    isPartOf: { "@id": websiteId },
    about: about ?? { "@id": organizationId },
    ...(image
      ? { primaryImageOfPage: { "@type": "ImageObject", url: image } }
      : {}),
  };
}

export function publicPageSchema({
  type,
  title,
  description,
  url,
  about,
  image,
}: {
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";
  title: string;
  description: string;
  url: string;
  about?: SchemaValue;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationEntity(),
      websiteEntity(publicSeo.home.description),
      pageEntity({ type, name: title, description, url, about, image }),
    ],
  };
}

export function articleSchema({
  title,
  description,
  url,
  image,
  createdAt,
  updatedAt,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationEntity(),
      websiteEntity(publicSeo.home.description),
      pageEntity({ type: "WebPage", name: title, description, url, image }),
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: title,
        description,
        url,
        mainEntityOfPage: { "@id": `${url}#webpage` },
        isPartOf: { "@id": websiteId },
        publisher: { "@id": organizationId },
        ...(image ? { image: [image] } : {}),
        ...(createdAt ? { datePublished: createdAt } : {}),
        ...(updatedAt ? { dateModified: updatedAt } : {}),
      },
    ],
  };
}

export function aboutPageSchema(
  title: string,
  description: string,
  url: string,
) {
  return publicPageSchema({
    type: "AboutPage",
    title,
    description,
    url,
    about: [
      { "@id": organizationId },
      {
        "@type": "Person",
        "@id": `${canonicalOrigin}/about#tanmay-jain`,
        name: "Tanmay Jain",
        jobTitle: "Founder & CEO",
        url: "https://www.linkedin.com/in/tnmy4903/",
        image: `${canonicalOrigin}/founder_image.png`,
      },
    ],
  });
}

function staticPageSchema(
  path: string | undefined,
  title: string,
  description: string,
) {
  const url = `${canonicalOrigin}${path || "/"}`;
  if (path === "/about") return aboutPageSchema(title, description, url);
  if (path === "/contact")
    return publicPageSchema({ type: "ContactPage", title, description, url });
  if (path === "/services" || path === "/portfolio" || path === "/blogs")
    return publicPageSchema({
      type: "CollectionPage",
      title,
      description,
      url,
    });
  if (path === "/" || path === "/showcase")
    return publicPageSchema({ title, description, url });
  return undefined;
}
