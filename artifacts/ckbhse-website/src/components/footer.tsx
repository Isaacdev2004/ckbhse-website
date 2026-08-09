import { Link } from 'wouter';
import { contentLoader } from '@/lib/content';
import { SkipNavLink } from '@/components/skip-link';
import { BrandLogo } from '@/components/brand-logo';

export function Footer() {
  const site = contentLoader.getSiteConfig();
  const { brand, footer } = site;
  const quickLinks =
    footer.sections.find((section) => section.id === 'quick-links') ??
    footer.sections[0];

  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8">
      <SkipNavLink />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-secondary-foreground/10">
          <div>
            <div className="mb-5 inline-flex rounded-xl bg-white p-3 shadow-sm">
              <BrandLogo
                href="/"
                size="lg"
                variant="full"
                data-testid="link-footer-logo"
              />
            </div>
            <p className="font-display font-semibold text-lg text-secondary-foreground">
              {brand.name}
            </p>
            <p className="mt-1 text-sm text-secondary-foreground/80">
              {footer.blurb}
            </p>
          </div>

          {quickLinks ? (
            <div>
              <h3 className="font-display font-semibold text-base mb-4">
                {quickLinks.title}
              </h3>
              <ul className="space-y-2">
                {quickLinks.links.map((link) => (
                  <li key={link.href + link.label}>
                    {link.available ? (
                      <Link
                        href={link.href}
                        className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                        data-testid={`link-footer-quick-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {link.label}
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <h3 className="font-display font-semibold text-base mb-4">Legal</h3>
            <ul className="space-y-2">
              {footer.legal.map((link) =>
                link.available ? (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      data-testid={`link-footer-legal-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-secondary-foreground/60">
            {footer.copyright}
          </p>
          {footer.utility.some((link) => link.available) ? (
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-secondary-foreground/60">
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
          ) : null}
        </div>
      </div>
    </footer>
  );
}
