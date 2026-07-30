import type { AccreditationItem } from '@workspace/content/schemas';
import { resolveIcon } from '@/lib/icons';

interface AccreditationGridProps {
  items: AccreditationItem[];
}

const categoryLabels: Record<AccreditationItem['category'], string> = {
  iso: 'ISO Certification',
  membership: 'Membership',
  award: 'Award',
  'professional-body': 'Professional Body',
};

export function AccreditationGrid({ items }: AccreditationGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        const Icon = resolveIcon(item.icon);
        return (
          <article
            key={item.slug}
            className="bg-card border border-card-border rounded-xl p-6 hover:shadow-md transition-all"
            aria-labelledby={`accreditation-${item.slug}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                  {categoryLabels[item.category]}
                </p>
                <h3
                  id={`accreditation-${item.slug}`}
                  className="font-display font-semibold text-lg text-foreground mb-2"
                >
                  {item.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
