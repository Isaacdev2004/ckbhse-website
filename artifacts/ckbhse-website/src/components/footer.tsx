import { Link } from 'wouter';
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Facebook,
} from 'lucide-react';

const serviceLinks = [
  { href: '/services#health-safety-audits', label: 'Health & Safety Audits' },
  { href: '/services#risk-assessments', label: 'Risk Assessments' },
  { href: '/services#iso-compliance', label: 'ISO Compliance' },
  { href: '/services#fire-safety', label: 'Fire Safety' },
  { href: '/services#environmental', label: 'Environmental Management' },
];

const industryLinks = [
  { href: '/industries#construction', label: 'Construction' },
  { href: '/industries#manufacturing', label: 'Manufacturing' },
  { href: '/industries#logistics', label: 'Logistics & Transport' },
  { href: '/industries#oil-gas', label: 'Oil & Gas' },
  { href: '/industries#healthcare', label: 'Healthcare' },
];

const companyLinks = [
  { href: '/knowledge', label: 'Knowledge Hub' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/careers', label: 'Careers' },
  { href: '/contact', label: 'Contact Us' },
];

const legalLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-conditions', label: 'Terms & Conditions' },
  { href: '/cookie-policy', label: 'Cookie Policy' },
];

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-secondary-foreground/10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 group mb-6"
              data-testid="link-footer-logo"
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg leading-none">
                  CKBHSE
                </span>
                <span className="text-xs text-secondary-foreground/70 font-medium">
                  Limited
                </span>
              </div>
            </Link>
            <p className="text-sm text-secondary-foreground/80 mb-6 max-w-sm">
              The HSEQ consultancy for organisations that take safety seriously.
              Expert consulting, accredited training, and modern compliance
              solutions.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <a
                  href="mailto:info@ckbhse.co.uk"
                  className="hover:text-primary transition-colors"
                  data-testid="link-email"
                >
                  info@ckbhse.co.uk
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <a
                  href="tel:+442012345678"
                  className="hover:text-primary transition-colors"
                  data-testid="link-phone"
                >
                  +44 20 1234 5678
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-secondary-foreground/80">
                  London, United Kingdom
                </span>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="font-display font-semibold text-base mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                    data-testid={`link-footer-service-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries Column */}
          <div>
            <h3 className="font-display font-semibold text-base mb-4">
              Industries
            </h3>
            <ul className="space-y-2">
              {industryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                    data-testid={`link-footer-industry-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-display font-semibold text-base mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                    data-testid={`link-footer-company-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-secondary-foreground/60">
            <p>
              &copy; {new Date().getFullYear()} CKBHSE Limited. All rights
              reserved.
            </p>
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-primary transition-colors"
                data-testid={`link-footer-legal-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-secondary-foreground/10 hover:bg-primary flex items-center justify-center transition-colors group"
              aria-label="LinkedIn"
              data-testid="link-social-linkedin"
            >
              <Linkedin className="w-4 h-4 group-hover:text-primary-foreground transition-colors" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-secondary-foreground/10 hover:bg-primary flex items-center justify-center transition-colors group"
              aria-label="Twitter"
              data-testid="link-social-twitter"
            >
              <Twitter className="w-4 h-4 group-hover:text-primary-foreground transition-colors" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-secondary-foreground/10 hover:bg-primary flex items-center justify-center transition-colors group"
              aria-label="Facebook"
              data-testid="link-social-facebook"
            >
              <Facebook className="w-4 h-4 group-hover:text-primary-foreground transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
