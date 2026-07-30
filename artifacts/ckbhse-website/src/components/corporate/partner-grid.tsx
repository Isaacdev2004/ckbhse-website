import type { PartnerItem } from '@workspace/content/schemas';

interface PartnerGridProps {
  items: PartnerItem[];
}

const categoryLabels: Record<PartnerItem['category'], string> = {
  technology: 'Technology',
  industry: 'Industry',
  strategic: 'Strategic',
  training: 'Training',
};

export function PartnerGrid({ items }: PartnerGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item) => (
        <article
          key={item.slug}
          className="bg-card border border-card-border rounded-xl p-6 hover:border-primary/40 transition-all"
          aria-labelledby={`partner-${item.slug}`}
        >
          <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">
            {categoryLabels[item.category]} Partner
          </p>
          <h3
            id={`partner-${item.slug}`}
            className="font-display font-semibold text-xl text-foreground mb-3"
          >
            {item.name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>
        </article>
      ))}
    </div>
  );
}
