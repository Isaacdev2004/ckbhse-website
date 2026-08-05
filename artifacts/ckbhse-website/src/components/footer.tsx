import { Link } from 'wouter';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Facebook,
} from 'lucide-react';
import { contentLoader } from '@/lib/content';
import { SkipNavLink } from '@/components/skip-link';
import { BrandLogo } from '@/components/brand-logo';

const socialIcons = {
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
} as const;

export function Footer() {
  const site = contentLoader.getSiteConfig();
  const { brand, contact, footer } = site;

  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8">
      <SkipNavLink />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10 pb-12 border-b border-secondary-foreground/10">
          <div className="lg:col-span-2">
            <div className="mb-6 inline-flex rounded-xl bg-white p-3 shadow-sm">
              <BrandLogo
                href="/"
                size="lg"
                variant="full"
                data-testid="link-footer-logo"
              />
            </div>
            <p className="text-sm text-secondary-foreground/80 mb-6 max-w-sm">
              {brand.tagline} {brand.description}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-primary" aria-hidden="true" />
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  data-testid="link-email"
                >
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-primary" aria-hidden="true" />
                <a
                  href={contact.phoneHref}
                  className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  data-testid="link-phone"
                >
                  {contact.phone}
                </a>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                <span className="text-secondary-foreground/80">
                  {contact.location}
                </span>
              </div>
            </div>
          </div>

          {footer.sections.map((section) => (
            <div key={section.id}>
              <h3 className="font-display font-semibold text-base mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    {link.available ? (
                      <Link
                        href={link.href}
                        className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                        data-testid={`link-footer-${section.id}-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span
                        className="text-sm text-secondary-foreground/40"
                        aria-disabled="true"
                      >
                        {link.label}
                        <span className="sr-only"> (coming soon)</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-8 border-b border-secondary-foreground/10">
          <h3 className="font-display font-semibold text-sm mb-4 text-secondary-foreground/80">
            Accreditations
          </h3>
          <div className="flex flex-wrap gap-3">
            {footer.accreditations.map((item) => (
              <span
                key={item.label}
                className={`rounded-lg border px-4 py-2 text-xs ${
                  item.available
                    ? 'border-secondary-foreground/20 text-secondary-foreground/70'
                    : 'border-dashed border-secondary-foreground/20 text-secondary-foreground/40'
                }`}
                aria-disabled={!item.available}
              >
                {item.label}
                {!item.available && (
                  <span className="sr-only"> (coming soon)</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-secondary-foreground/60">
            <p>
              &copy; {new Date().getFullYear()} CKBHSE Limited. All rights
              reserved.
            </p>
            {footer.legal.map((link) =>
              link.available ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  data-testid={`link-footer-legal-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                </Link>
              ) : (
                <span
                  key={link.label}
                  className="text-secondary-foreground/40"
                  aria-disabled="true"
                >
                  {link.label}
                </span>
              ),
            )}
            {footer.utility.map((link) =>
              link.available ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  data-testid={`link-footer-utility-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                </Link>
              ) : null,
            )}
          </div>

          <div className="flex items-center gap-4">
            {footer.social.map((social) => {
              const Icon = socialIcons[social.platform];
              return (
                <a
                  key={social.platform}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-lg bg-secondary-foreground/10 hover:bg-primary flex items-center justify-center transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={social.label}
                  data-testid={`link-social-${social.platform}`}
                >
                  <Icon className="w-4 h-4 group-hover:text-primary-foreground transition-colors" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
