import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SEO, publicSeo } from '../components/SEO';

const buildCards = [
  ['01', 'Digital products', 'Websites, apps and custom software shaped around the way your business works.'],
  ['02', 'AI & operations', 'Connected systems that remove manual friction and help your team move faster.'],
  ['03', 'Design & brand', 'Clear interfaces and distinctive visual systems that make every touchpoint feel intentional.'],
  ['04', 'Launch & delivery', 'Reliable infrastructure and a considered path from build to a confident release.'],
] as const;

const processSteps = [
  ['Discovery & Requirements', 'Understand your goals, users, constraints, and success metrics.'],
  ['Scope & Estimation', 'Turn the brief into deliverables, milestones, timeline, and investment.'],
  ['Agreement & Kickoff', 'Align on terms, responsibilities, tools, and a clear communication rhythm.'],
  ['Design & Development', 'Shape the experience and build iteratively with regular reviews and feedback.'],
  ['Testing & QA', 'Validate performance, security, responsiveness, and usability before launch.'],
  ['Deployment & Handover', 'Launch smoothly with documentation, knowledge transfer, and support.'],
  ['Launch Support', 'Stay confident after release with updates, optimization, and the next useful capability.'],
] as const;

export function HomePage() {
  return (
    <main className="public-page home-page">
      <SEO {...publicSeo.home} path="/" />
      <section className="hero-shell" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow">Software development agency</p>
          <h1 id="home-title">Build Digital Products That Scale</h1>
          <p className="hero-lede">Upserve designs and builds websites, mobile apps, custom software and AI tools — from the first requirement through to delivery and support.</p>
          <div className="hero-actions">
            <Link className="button-link" to="/contact">Start a Project <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link className="text-link hero-secondary-link" to="/portfolio">See Our Work <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="hero-panel" aria-label="What we do">
          <span className="hero-panel__label">What we do</span>
          <strong>Ideas, shaped into products people enjoy using.</strong>
          <div className="hero-panel__line" />
          <div className="hero-panel__meta"><span>Strategy</span><span>Design</span><span>Engineering</span></div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="build-title">
        <div className="section-heading home-section__heading">
          <div>
            <p className="eyebrow">What we build</p>
            <h2 id="build-title">What We Build</h2>
            <p>We handle the full product lifecycle — from first requirement to deployment and support.</p>
          </div>
          <Link className="text-link" to="/services">View All Services <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className="capability-category-grid">
          {buildCards.map(([number, title, description]) => <article className="capability-category" key={title}>
            <span className="capability-category__number">{number}</span>
            <strong className="capability-category__title">{title}</strong>
            <p>{description}</p>
          </article>)}
        </div>
      </section>

      <section className="home-section home-process" aria-labelledby="process-title">
        <div className="section-heading home-section__heading">
          <div>
            <p className="eyebrow">Our process</p>
            <h2 id="process-title">A Clear Path From Conversation to Delivery</h2>
            <p>We follow a structured, client-first process so every project stays on time, in scope, and easy to follow.</p>
          </div>
        </div>
        <div className="process-steps" aria-label="Project process">
          {processSteps.map(([step, description], index) => <div className="process-step" key={step}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{step}</strong>
            <p>{description}</p>
          </div>)}
        </div>
      </section>

      <section className="home-platform" aria-labelledby="platform-title">
        <div>
          <p className="eyebrow">Our internal platform</p>
          <h2 id="platform-title">Run By a System We Built Ourselves</h2>
          <p>Our internal platform connects requirements, quotations, projects and delivery in one place. It's how we run client work — not a product for sale.</p>
          <Link className="button-link button-link--quiet" to="/showcase">See the Platform <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <figure className="home-platform__visual">
          <img src="/home_page.png" alt="Abstract Upserve product workflow visual" loading="lazy" />
        </figure>
      </section>

      <section className="home-cta" aria-labelledby="home-cta-title">
        <div>
          <p className="eyebrow">Start with the requirement</p>
          <h2 id="home-cta-title">Have a Project in Mind?</h2>
          <p>Tell us what you're building. No pressure — just an honest conversation about what's possible.</p>
        </div>
        <Link className="button-link" to="/contact">Start a Project <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>
    </main>
  );
}
