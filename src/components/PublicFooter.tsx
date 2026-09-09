import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';

const services = ['Website Development', 'App Development', 'Software Development', 'AI & AI Agents', 'Automation & Internal Tools', 'UI/UX & Brand Design'];

export function PublicFooter() {
  return (
    <footer className="public-footer" aria-label="Upserve footer">
      <div className="public-footer__inner">
        <div className="public-footer__brand">
          <Link className="public-footer__logo" to="/" aria-label="Upserve home"><BrandLogo /></Link>
          <p>Upserve builds websites, apps, AI tools and custom software — end-to-end, from requirement to delivery.</p>
        </div>
        <div className="public-footer__column">
          <p className="public-footer__label">What We Do</p>
          <ul>{services.map((service, index) => <li key={service}><Link to={`/services#service-${index + 1}`}>{service}</Link></li>)}</ul>
        </div>
        <nav className="public-footer__column" aria-label="Footer navigation">
          <p className="public-footer__label">Explore</p>
          <ul>
            <li><Link to="/portfolio">Our Work <ArrowUpRight size={13} aria-hidden="true" /></Link></li>
            <li><Link to="/showcase">Platform Showcase <ArrowUpRight size={13} aria-hidden="true" /></Link></li>
            <li><Link to="/blogs">Insights <ArrowUpRight size={13} aria-hidden="true" /></Link></li>
            <li><Link to="/about">About Upserve <ArrowUpRight size={13} aria-hidden="true" /></Link></li>
          </ul>
        </nav>
        <div className="public-footer__column public-footer__contact">
          <p className="public-footer__label">Have a good idea?</p>
          <p className="public-footer__cta">Let's make it useful</p>
          <p>Bring us the brief, the question or the messy first draft.</p>
          <Link className="public-footer__contact-link" to="/contact">Start a Project <ArrowUpRight size={15} aria-hidden="true" /></Link>
          <Link className="public-footer__client-portal" to="/login">Client Portal</Link>
          <div className="public-footer__socials"><a href="https://www.linkedin.com/in/tnmy4903/" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={13} aria-hidden="true" /></a><a href="https://www.instagram.com/tnmy4903/" target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={13} aria-hidden="true" /></a><a href="https://github.com/tnmy4903/" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={13} aria-hidden="true" /></a></div>
        </div>
      </div>
      <div className="public-footer__bottom"><div><span>© {new Date().getFullYear()} Upserve. All rights reserved.</span><span>Strategy · Design · Engineering</span></div><div className="public-footer__legal"><details><summary>Privacy</summary><p>We respect your privacy and do not share your personal information with third parties without your consent.</p></details><details><summary>Terms</summary><p>By using our services, you agree to our terms of service, project policies, and payment terms outlined in our proposals and agreements.</p></details></div></div>
    </footer>
  );
}
