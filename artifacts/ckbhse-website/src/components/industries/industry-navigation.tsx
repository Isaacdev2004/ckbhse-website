import { Link } from 'wouter';
import { contentLoader } from '@/lib/content';
import { INDUSTRY_SECTOR_LABELS } from '@workspace/content/schemas';

interface IndustryNavigationProps {
  activeSlug: string;
}

export function IndustryNavigation({ activeSlug }: IndustryNavigationProps) {
  const pages = contentLoader.getIndustryPages();
  const sectors = contentLoader.getIndustriesHubPage().sectors;

  return (
    <nav aria-label="Industry sectors" className="space-y-6">
      {sectors.map((sector) => {
        const sectorPages = pages.filter((p) => p.sector === sector.id);
        if (sectorPages.length === 0) return null;

        return (
          <div key={sector.id}>
            <Link
              href={`/industries?sector=${sector.id}`}
              className="font-display font-semibold text-sm uppercase tracking-wide text-foreground hover:text-primary transition-colors"
            >
              {sector.label}
            </Link>
            <ul className="mt-2 space-y-1">
              {sectorPages.map((industry) => {
                const isActive = industry.slug === activeSlug;
                return (
                  <li key={industry.path}>
                    <Link
                      href={industry.path}
                      aria-current={isActive ? 'page' : undefined}
                      className={`block text-sm py-1.5 px-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {industry.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground pt-2 border-t border-border">
        {sectors.length} sectors · {pages.length} industries
      </p>
    </nav>
  );
}

export { INDUSTRY_SECTOR_LABELS };
