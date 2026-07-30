import { Link } from 'wouter';
import { contentLoader } from '@/lib/content';
import { RESOURCE_TYPE_LABELS } from '@workspace/content/schemas';

interface ResourceNavigationProps {
  activeType: string;
  activeSlug: string;
}

export function ResourceNavigation({
  activeType,
  activeSlug,
}: ResourceNavigationProps) {
  const pages = contentLoader.getResourcePages();
  const hub = contentLoader.getResourcesHubPage();

  return (
    <nav aria-label="Knowledge Centre resources" className="space-y-6">
      {hub.resourceTypes.map((type) => {
        const typePages = pages.filter((p) => p.type === type.id);
        if (typePages.length === 0) return null;

        return (
          <div key={type.id}>
            <Link
              href={`/resources?type=${type.id}`}
              className="font-display font-semibold text-sm uppercase tracking-wide text-foreground hover:text-primary transition-colors"
            >
              {type.label}
            </Link>
            <ul className="mt-2 space-y-1">
              {typePages.map((resource) => {
                const isActive =
                  resource.type === activeType && resource.slug === activeSlug;
                return (
                  <li key={resource.path}>
                    <Link
                      href={resource.path}
                      aria-current={isActive ? 'page' : undefined}
                      className={`block text-sm py-1.5 px-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {resource.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground pt-2 border-t border-border">
        {hub.resourceTypes.length} categories · {pages.length} resources
      </p>
    </nav>
  );
}

export { RESOURCE_TYPE_LABELS };
