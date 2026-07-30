import { Link } from 'wouter';
import type { ServiceCategoryId } from '@workspace/content/schemas';
import { SERVICE_CATEGORY_LABELS } from '@workspace/content/schemas';
import { contentLoader } from '@/lib/content';

interface ServiceNavigationProps {
  activeCategory: ServiceCategoryId;
  activeSlug: string;
}

export function ServiceNavigation({
  activeCategory,
  activeSlug,
}: ServiceNavigationProps) {
  const pages = contentLoader.getServicePages();
  const categories = contentLoader.getServicesHubPage().categories;

  return (
    <nav aria-label="Service categories" className="space-y-6">
      {categories.map((category) => {
        const categoryServices = pages.filter(
          (p) => p.category === category.id,
        );
        if (categoryServices.length === 0) return null;

        return (
          <div key={category.id}>
            <Link
              href={`/services?category=${category.id}`}
              className="font-display font-semibold text-sm uppercase tracking-wide text-foreground hover:text-primary transition-colors"
            >
              {category.label}
            </Link>
            <ul className="mt-2 space-y-1">
              {categoryServices.map((service) => {
                const isActive =
                  service.category === activeCategory &&
                  service.slug === activeSlug;
                return (
                  <li key={service.path}>
                    <Link
                      href={service.path}
                      aria-current={isActive ? 'page' : undefined}
                      className={`block text-sm py-1.5 px-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {service.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground pt-2 border-t border-border">
        {Object.keys(SERVICE_CATEGORY_LABELS).length} practice areas ·{' '}
        {pages.length} services
      </p>
    </nav>
  );
}
