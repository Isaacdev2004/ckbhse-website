import type { FeatureItem } from '@workspace/content/schemas';
import { resolveIcon } from '@/lib/icons';

interface FeatureGridProps {
  items: FeatureItem[];
}

export function FeatureGrid({ items }: FeatureGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        const Icon = resolveIcon(item.icon);
        return (
          <article
            key={item.title}
            className="bg-card border border-card-border rounded-xl p-6 hover:border-primary/40 transition-all"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}
