import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { blogApi } from "../features/blog/services/blogApi";
import { portfolioApi } from "../features/portfolio/services/portfolioApi";
import { contactApi } from "../features/contact/services/contactApi";
import type { ContentRecord } from "../types/content";
import { LoadingState } from "../components/ui";
import {
  SEO,
  aboutPageSchema,
  articleSchema,
  publicImage,
  publicPageSchema,
  publicSeo,
  useSEO,
  useStructuredData,
} from "../components/SEO";

type PublicRecord = ContentRecord;

const value = (record: PublicRecord, key: string, fallback = "") =>
  String(record[key] ?? fallback);
const list = (record: PublicRecord, key: string) =>
  Array.isArray(record[key]) ? record[key].map(String) : [];
const contentSummary = (record: PublicRecord) =>
  value(record, "excerpt") ||
  value(record, "description") ||
  value(record, "content").replace(/\s+/g, " ").trim().slice(0, 160);
const featureNames = (record: PublicRecord) =>
  Array.isArray(record.features)
    ? record.features
        .map((item) =>
          typeof item === "string"
            ? item
            : item && typeof item === "object"
              ? String(
                  (item as Record<string, unknown>).title ??
                    (item as Record<string, unknown>).name ??
                    "",
                )
              : "",
        )
        .filter(Boolean)
    : [];
const date = (raw: unknown) =>
  raw
    ? new Date(String(raw)).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";
const readingTime = (content: string) =>
  `${Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200))} min read`;

function State({
  loading,
  error,
  onRetry,
  heading = "h2",
}: {
  loading: boolean;
  error: string;
  onRetry?: () => void;
  heading?: "h1" | "h2";
}) {
  if (loading) return <LoadingState label="Loading content" />;
  if (error) {
    const Heading = heading;
    return (
      <div className="public-state error" role="alert">
        <Heading>We couldn't load this content.</Heading>
        <span>{error}</span>
        {onRetry && (
          <button type="button" className="secondary" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }
  return null;
}

function Cover({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed)
    return (
      <div
        className={`content-cover content-cover--fallback ${className}`}
        role="img"
        aria-label={alt || "Upserve content"}
      >
        <span>Upserve</span>
      </div>
    );
  return (
    <img
      className={`content-cover ${className}`}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export function BlogsPage() {
  const [items, setItems] = useState<PublicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setLoading(true);
    setError("");
    blogApi
      .list()
      .then(setItems)
      .catch(() => setError("Published insights are temporarily unavailable."))
      .finally(() => setLoading(false));
  }, [attempt]);
  return (
    <main className="public-page content-page">
      <SEO {...publicSeo.blogs} path="/blogs" />
      <div className="content-intro">
        <p className="eyebrow">Upserve insights</p>
        <h1>Ideas for Building What's Next</h1>
        <p>
          Practical perspectives on digital products, technology and building
          better experiences.
        </p>
      </div>
      <State
        loading={loading}
        error={error}
        onRetry={() => setAttempt((value) => value + 1)}
      />
      {!loading &&
        !error &&
        (items.length ? (
          <div className="editorial-grid">
            {items.map((item) => {
              const content = value(item, "content");
              const excerpt = value(item, "excerpt", content);
              const title = value(item, "title");
              return (
                <article
                  className="editorial-card"
                  key={value(item, "id", value(item, "slug"))}
                >
                  <Cover
                    src={value(item, "thumbnail")}
                    alt={title || "Upserve content"}
                  />
                  <div className="editorial-card__body">
                    <div className="content-meta">
                      <span>Insights</span>
                      <span>{date(item.createdAt)}</span>
                      <span>{readingTime(content)}</span>
                    </div>
                    <strong className="editorial-card__title">{title}</strong>
                    <p>
                      {excerpt.slice(0, 180)}
                      {excerpt.length > 180 ? "…" : ""}
                    </p>
                    <Link
                      className="text-link"
                      to={`/blogs/${encodeURIComponent(value(item, "slug"))}`}
                    >
                      Read article <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h2>Fresh thinking is on the way.</h2>
            <p>There are no published articles yet.</p>
          </div>
        ))}
    </main>
  );
}

export function BlogDetailPage() {
  const { slug = "" } = useParams();
  const [item, setItem] = useState<PublicRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setLoading(true);
    setError("");
    setItem(null);
    blogApi
      .getBySlug(slug)
      .then(setItem)
      .catch(() => setError("This insight is not available."))
      .finally(() => setLoading(false));
  }, [slug, attempt]);
  const title = item
    ? `${value(item, "title")} | Upserve`
    : error
      ? "Insight not found | Upserve"
      : publicSeo.blogs.title;
  const description = item
    ? contentSummary(item)
    : error
      ? "This insight is not available."
      : publicSeo.blogs.description;
  useStructuredData(
    item
      ? articleSchema({
          title: value(item, "title"),
          description,
          url: `https://upserve.in/blogs/${encodeURIComponent(slug)}`,
          image: publicImage(value(item, "thumbnail")),
          createdAt: value(item, "createdAt") || undefined,
          updatedAt: value(item, "updatedAt") || undefined,
        })
      : undefined,
  );
  return (
    <main className="public-page content-page">
      <SEO
        title={title}
        description={description}
        path={`/blogs/${encodeURIComponent(slug)}`}
        image={item ? publicImage(value(item, "thumbnail")) : undefined}
        type="article"
        indexable={Boolean(item)}
      />
      <Link className="back-link" to="/blogs">
        <ArrowLeft size={16} aria-hidden="true" /> Back to insights
      </Link>
      <State
        loading={loading}
        error={error}
        heading="h1"
        onRetry={() => setAttempt((value) => value + 1)}
      />
      {item && (
        <article className="article-detail">
          <Cover
            src={value(item, "thumbnail")}
            alt={value(item, "title") || "Upserve content"}
            className="article-detail__cover"
          />
          <div className="article-detail__inner">
            <div className="content-meta">
              <span>Insights</span>
              <span>{date(item.createdAt)}</span>
              <span>{readingTime(value(item, "content"))}</span>
              {item.views !== undefined && (
                <span>{value(item, "views")} views</span>
              )}
            </div>
            <h1>{value(item, "title")}</h1>
            <div className="article-body">{value(item, "content")}</div>
          </div>
        </article>
      )}
    </main>
  );
}

export function PortfolioPage() {
  const [items, setItems] = useState<PublicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setLoading(true);
    setError("");
    portfolioApi
      .listPublic()
      .then(setItems)
      .catch(() => setError("Published work is temporarily unavailable."))
      .finally(() => setLoading(false));
  }, [attempt]);
  return (
    <main className="public-page content-page">
      <SEO {...publicSeo.portfolio} path="/portfolio" />
      <div className="content-intro">
        <p className="eyebrow">Selected work</p>
        <h1>Work We're Proud Of</h1>
        <p>
          A selection of digital products and experiences we've helped bring
          from first idea to delivery.
        </p>
      </div>
      <State
        loading={loading}
        error={error}
        onRetry={() => setAttempt((value) => value + 1)}
      />
      {!loading &&
        !error &&
        (items.length ? (
          <div className="case-grid">
            {items.map((item) => {
              const title = value(item, "title");
              return (
                <article
                  className="case-card"
                  key={value(item, "id", value(item, "slug"))}
                >
                  <Cover
                    src={list(item, "images")[0] || ""}
                    alt={title || "Upserve content"}
                  />
                  <div className="case-card__body">
                    <div className="content-meta">
                      <span>{value(item, "category", "Case study")}</span>
                      {item.featured === true && (
                        <span className="featured-label">Featured</span>
                      )}
                    </div>
                    <strong className="case-card__title">{title}</strong>
                    <p>{value(item, "description")}</p>
                    <div className="tag-row">
                      {list(item, "techStack")
                        .slice(0, 3)
                        .map((tag) => (
                          <span className="tag" key={tag}>
                            {tag}
                          </span>
                        ))}
                    </div>
                    <Link
                      className="text-link"
                      to={`/portfolio/${encodeURIComponent(value(item, "slug"))}`}
                    >
                      View case study{" "}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h2>Our work is taking shape.</h2>
            <p>
              Published projects will appear here when they are ready to share.
            </p>
          </div>
        ))}
    </main>
  );
}

export function PortfolioDetailPage() {
  const { slug = "" } = useParams();
  const [item, setItem] = useState<PublicRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setLoading(true);
    setError("");
    setItem(null);
    portfolioApi
      .getBySlug(slug)
      .then(setItem)
      .catch(() => setError("This project is not available."))
      .finally(() => setLoading(false));
  }, [slug, attempt]);
  const features = item ? featureNames(item) : [];
  const title = item
    ? `${value(item, "title")} | Upserve`
    : error
      ? "Work not found | Upserve"
      : publicSeo.portfolio.title;
  const description = item
    ? value(item, "description") || publicSeo.portfolio.description
    : error
      ? "This project is not available."
      : publicSeo.portfolio.description;
  const image = item ? publicImage(list(item, "images")[0]) : undefined;
  useStructuredData(
    item
      ? publicPageSchema({
          title,
          description,
          url: `https://upserve.in/portfolio/${encodeURIComponent(slug)}`,
          image,
        })
      : undefined,
  );
  return (
    <main className="public-page content-page">
      <SEO
        title={title}
        description={description}
        path={`/portfolio/${encodeURIComponent(slug)}`}
        image={image}
        type="article"
        indexable={Boolean(item)}
      />
      <Link className="back-link" to="/portfolio">
        <ArrowLeft size={16} aria-hidden="true" /> Back to selected work
      </Link>
      <State
        loading={loading}
        error={error}
        heading="h1"
        onRetry={() => setAttempt((value) => value + 1)}
      />
      {item && (
        <>
          <article className="case-detail">
            <div className="case-detail__hero">
              <Cover
                src={list(item, "images")[0] || ""}
                alt={value(item, "title") || "Upserve content"}
              />
              <div>
                <div className="content-meta">
                  <span>{value(item, "category", "Case study")}</span>
                  {item.featured === true && (
                    <span className="featured-label">Featured</span>
                  )}
                </div>
                <h1>{value(item, "title")}</h1>
                <p>{value(item, "description")}</p>
                <div className="tag-row">
                  {list(item, "techStack").map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="actions">
                  {value(item, "websiteUrl") && (
                    <a
                      className="button-link"
                      href={value(item, "websiteUrl")}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit live project{" "}
                      <ExternalLink size={16} aria-hidden="true" />
                    </a>
                  )}
                  {value(item, "githubUrl") && (
                    <a
                      className="button-link button-link--quiet"
                      href={value(item, "githubUrl")}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View source <ExternalLink size={16} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            {features.length > 0 && (
              <section className="case-detail__features">
                <p className="eyebrow">Project features</p>
                <div>
                  {features.map((feature) => (
                    <span className="tag" key={feature}>
                      {feature}
                    </span>
                  ))}
                </div>
              </section>
            )}
            {list(item, "images").length > 1 && (
              <div className="case-gallery">
                {list(item, "images")
                  .slice(1)
                  .map((image, index) => (
                    <Cover
                      key={image}
                      src={image}
                      alt={`${value(item, "title") || "Upserve content"} detail ${index + 2}`}
                    />
                  ))}
              </div>
            )}
          </article>
          <section className="home-cta case-detail-cta">
            <div>
              <p className="eyebrow">Have a similar project in mind?</p>
              <h2>Let's build yours.</h2>
            </div>
            <Link className="button-link" to="/contact">
              Start a Project <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </section>
        </>
      )}
    </main>
  );
}

const finalServices = [
  [
    "Website Development",
    "Custom, fast, SEO-ready websites and web applications.",
    "We design and build websites and web applications that are fast, responsive, and built to rank.",
    "Design, CMS setup, e-commerce (where needed), deployment.",
  ],
  [
    "App Development",
    "iOS and Android apps, native or cross-platform.",
    "We build mobile apps for iOS and Android, native or cross-platform, designed for real engagement.",
    "UI/UX design, development, API integration, app store submission.",
  ],
  [
    "Software Development",
    "Custom business tools built around how your team actually works.",
    "We build custom software — CRMs, ERPs, dashboards, and internal systems — tailored to your workflow.",
    "Requirement analysis, development, integration, training, support.",
  ],
  [
    "AI & AI Agents",
    "Chatbots and automation agents that save time and improve decisions.",
    "We build AI tools — chatbots, automation agents, and applied AI features — that save time and support better decisions.",
    "Custom model integration, analytics, continuous improvement.",
  ],
  [
    "Automation & Internal Tools",
    "Dashboards, workflows and integrations that remove manual work.",
    "We build dashboards, internal tools, and automated workflows that eliminate repetitive manual work.",
    "Process audit, tool build, APIs & integrations, cloud setup & deployment, team training.",
  ],
  [
    "UI/UX & Brand Design",
    "User-centered product design and a distinctive visual identity.",
    "We design user-centered products and the visual identity that carries them — from research to a finished brand system.",
    "Research, design systems, prototypes, logo direction, brand guidelines.",
  ],
] as const;

export function ServicesPage() {
  return (
    <main className="public-page content-page services-page">
      <SEO {...publicSeo.services} path="/services" />
      <div className="content-intro">
        <p className="eyebrow">Our services</p>
        <h1>What We Build</h1>
        <p>
          From websites to custom software and AI tools — here's what's included
          in each type of engagement.
        </p>
        <Link className="button-link" to="/contact">
          Tell Us What You're Building{" "}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <section className="services-detail-grid" aria-label="Upserve services">
        {finalServices.map(
          ([title, positioning, description, included], index) => (
            <article
              className="services-detail-card"
              id={`service-${index + 1}`}
              key={title}
            >
              <span className="eyebrow">
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong className="service-card-title">{title}</strong>
              <p className="service-card__focus">{positioning}</p>
              <p>{description}</p>
              <p className="service-card__included">
                <span>Includes</span>
                {included}
              </p>
            </article>
          ),
        )}
      </section>
      <section
        className="services-support"
        aria-labelledby="services-support-title"
      >
        <div>
          <p className="eyebrow">A clear next step</p>
          <h2 id="services-support-title">Not Sure Which Service You Need?</h2>
          <p>
            Tell us what you're building — we'll help you figure out the right
            scope. Every engagement follows the same clear process, and every
            project runs through the platform we built to keep it organized.
          </p>
          <div className="services-support__links">
            <Link className="text-link" to="/#process-title">
              See how we work <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link className="text-link" to="/showcase">
              See the platform <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <section className="home-cta" aria-labelledby="services-cta-title">
        <div>
          <p className="eyebrow">Start with the requirement</p>
          <h2 id="services-cta-title">Not Sure Which Service You Need?</h2>
          <p>
            Tell us what you're building — we'll help you figure out the right
            scope.
          </p>
        </div>
        <Link className="button-link" to="/contact">
          Tell Us What You're Building{" "}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}

export function ShowcasePage() {
  const workflow = [
    ["01", "Requirement", "Capture the real need."],
    ["02", "Scope", "Turn it into clear deliverables."],
    ["03", "Build", "Track progress in one place."],
    ["04", "Deliver", "Share the outcome and next step."],
  ] as const;
  const capabilities = [
    [
      "Clarity",
      "Keep the next decision and the current project context easy to see.",
    ],
    [
      "Control",
      "Give the team a shared workflow for requirements, scope, delivery, and payment.",
    ],
    [
      "Delivery visibility",
      "Make meaningful project progress easier for clients and the team to follow.",
    ],
  ] as const;

  return (
    <main className="public-page content-page showcase-page">
      <SEO {...publicSeo.showcase} path="/showcase" />
      <div className="content-intro">
        <p className="eyebrow">Platform showcase</p>
        <h1>How We Run the Work</h1>
        <p>
          This is the internal platform we use to manage every project — not a
          product for sale. It keeps requirements, delivery and communication in
          one place.
        </p>
      </div>
      <section
        className="showcase-frame"
        aria-labelledby="showcase-workflow-title"
      >
        <div className="showcase-frame__bar">
          <span />
          <span />
          <span />
          <strong>Upserve workspace</strong>
        </div>
        <div className="showcase-frame__body">
          <h2 id="showcase-workflow-title">
            From Requirement to Delivery, in One Place
          </h2>
          <p>
            One connected workflow keeps decisions, delivery and communication
            moving together.
          </p>
          <div
            className="showcase-workflow"
            aria-label="Requirement to delivery workflow"
          >
            {workflow.map(([number, title, description]) => (
              <div key={number}>
                <span>{number}</span>
                <strong>{title}</strong>
                <small>{description}</small>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        className="showcase-annotations"
        aria-labelledby="showcase-capabilities-title"
      >
        <div className="showcase-annotations__heading">
          <p className="eyebrow">Capability annotations</p>
          <h2 id="showcase-capabilities-title">What It Gives Us</h2>
        </div>
        {capabilities.map(([title, description], index) => (
          <article className="services-detail-card" key={title}>
            <span className="eyebrow">
              {String(index + 1).padStart(2, "0")}
            </span>
            <strong className="showcase-annotation-title">{title}</strong>
            <p>{description}</p>
          </article>
        ))}
      </section>
      <section
        className="home-platform showcase-cta"
        aria-labelledby="showcase-cta-title"
      >
        <div>
          <p className="eyebrow">Built for our own work</p>
          <h2 id="showcase-cta-title">Need a System Like This?</h2>
          <p>
            Tell us what your business needs to run more clearly — we'll start
            with the requirement.
          </p>
        </div>
        <Link className="button-link" to="/contact">
          Let's Talk <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}

export function AboutPage() {
  return (
    <main className="public-page content-page about-page">
      <SEO {...publicSeo.about} path="/about" />
      <div className="content-intro">
        <p className="eyebrow">About Upserve</p>
        <h1>Useful Digital Products, Shaped With Care</h1>
        <p>
          Upserve is a software development partner for businesses that want to
          build, automate and scale digital products with confidence.
        </p>
      </div>
      <section className="about-founder" aria-labelledby="founder-title">
        <div className="about-founder__media">
          <div className="about-founder__portrait">
            <img
              src="/founder_image.png"
              alt="Tanmay Jain, Founder and CEO of Upserve"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="about-founder__identity">
            <div>
              <strong>Tanmay Jain</strong>
              <span>
                Founder &amp; CEO, Upserve · Software Entrepreneur · Digital
                Product Strategist
              </span>
            </div>
            <a
              className="founder-linkedin"
              href="https://www.linkedin.com/in/tnmy4903/"
              target="_blank"
              rel="noreferrer"
            >
              <span className="founder-linkedin__mark" aria-hidden="true">
                in
              </span>
              <span>View LinkedIn profile</span>
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="about-founder__content">
          <p className="eyebrow">A note from the founder</p>
          <blockquote className="about-founder__quote">
            "Great products aren't built overnight — they're crafted with
            clarity, consistency, and a relentless focus on value."
            <cite>Tanmay Jain, Founder of Upserve</cite>
          </blockquote>
          <h2 id="founder-title">
            Building products with clarity, consistency, and a relentless focus
            on value.
          </h2>
          <p>
            Tanmay Jain is the founder and CEO of Upserve, a software
            development agency based in Indore, India. He leads a team that
            builds custom software, mobile apps, AI-powered automation and cloud
            infrastructure — combining technical delivery with clear
            communication throughout.
          </p>
        </div>
      </section>
      <section className="about-video" aria-labelledby="about-video-title">
        <div className="about-video__heading">
          <h2 id="about-video-title">See How We Think About the Work</h2>
          <p>
            A short introduction to how Upserve turns a clear requirement into a
            working product.
          </p>
        </div>
        <div className="about-video__frame">
          <iframe
            src="https://www.youtube.com/embed/aqz-KE-bpKQ"
            title="Upserve company introduction"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>
      <section className="about-why" aria-labelledby="about-why-title">
        <div>
          <h2 id="about-why-title">Why Upserve</h2>
        </div>
        <p>
          We've seen businesses struggle with agencies that overpromise,
          underdeliver, or disappear after launch. Upserve stays close to the
          product as it evolves — clear communication, and a real stake in the
          outcome.
        </p>
      </section>
      <section
        className="about-expectations"
        aria-labelledby="about-expectations-title"
      >
        <h2 id="about-expectations-title">What Clients Can Expect</h2>
        <div className="about-expectations__grid">
          {[
            "Clear communication",
            "Defined scope",
            "Structured requirements",
            "Delivery-oriented execution",
          ].map((item) => (
            <div key={item}>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="home-cta" aria-labelledby="about-cta-title">
        <div>
          <h2 id="about-cta-title">Tell Us What You're Building</h2>
        </div>
        <Link className="button-link" to="/contact">
          Start a Conversation <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}

export function ContactPage() {
  useSEO({ ...publicSeo.contact, path: "/contact" });
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    business: "",
    message: "",
  });
  const [state, setState] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setState("");
    const payload = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
      phone: form.phone.trim() || undefined,
      companyName: form.companyName.trim() || undefined,
      business: form.business.trim() || undefined,
    };
    if (payload.name.length < 2 || payload.message.length < 10) {
      setState(
        "Please enter your name and a message with at least 10 characters.",
      );
      requestAnimationFrame(() =>
        document.querySelector<HTMLInputElement>(".public-form input")?.focus(),
      );
      return;
    }
    setBusy(true);
    try {
      await contactApi.submit(payload);
      setForm({
        name: "",
        email: "",
        phone: "",
        companyName: "",
        business: "",
        message: "",
      });
      setState("success");
    } catch (error) {
      setState(
        error instanceof Error ? error.message : "Unable to send your message.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="public-page contact-page">
      <div className="contact-layout">
        <div className="content-intro">
          <p className="eyebrow">Get in touch</p>
          <h1>Ready to Start Your Project?</h1>
          <p>
            Tell us what you're working on, what's getting in the way, and where
            you want to go.
          </p>
          <div className="contact-details">
            <a href="mailto:tnmy4903@gmail.com">
              <span>Email</span>
              <strong>tnmy4903@gmail.com</strong>
            </a>
            <a href="tel:+918858314903">
              <span>Phone</span>
              <strong>+91 88583 14903</strong>
            </a>
            <div>
              <span>Location</span>
              <strong>Indore, Madhya Pradesh, India</strong>
            </div>
          </div>
          <div className="contact-note">
            <strong>Prefer a quick call?</strong>
            <span>
              Book a focused conversation about your goals and the right next
              step.
            </span>
            <a className="text-link" href="tel:+918858314903">
              Book a Call <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
        <form className="public-form" onSubmit={submit}>
          <h2>Tell us about your project</h2>
          <p className="muted">
            A little context helps us make our first conversation useful.
          </p>
          {state === "success" ? (
            <div className="success" role="status">
              Thanks for reaching out — we've received your message and will get
              back to you soon.
            </div>
          ) : (
            state && (
              <div className="error" role="alert">
                {state}
              </div>
            )
          )}
          <label>
            Your name
            <input
              required
              minLength={2}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Work email
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Phone <span className="optional">Optional</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label>
            Company name <span className="optional">Optional</span>
            <input
              value={form.companyName}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
            />
          </label>
          <label>
            What does your business do?{" "}
            <span className="optional">Optional</span>
            <input
              value={form.business}
              onChange={(e) => setForm({ ...form, business: e.target.value })}
            />
          </label>
          <label>
            How can we help?
            <textarea
              required
              minLength={10}
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </label>
          <button disabled={busy}>{busy ? "Sending…" : "Send enquiry"}</button>
        </form>
      </div>
    </main>
  );
}
