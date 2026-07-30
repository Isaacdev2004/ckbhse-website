import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';
import type { BreadcrumbItem } from '@/lib/content';
import { buildBreadcrumbListSchema } from '@/lib/seo';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  const jsonLd = buildBreadcrumbListSchema(items);

  return (
    <nav
      aria-label="Breadcrumb"
      className={`py-4 ${className}`}
      data-testid="nav-breadcrumbs"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol
        className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {index > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60"
                  aria-hidden="true"
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                  itemProp="item"
                  data-testid={`link-breadcrumb-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span
                  className={isLast ? 'font-medium text-foreground' : undefined}
                  itemProp="name"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              <meta itemProp="position" content={String(index + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
