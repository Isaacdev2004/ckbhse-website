import type { GovernanceItem } from '@workspace/content/schemas';
import { resolveIcon } from '@/lib/icons';

interface GovernanceCardsProps {
  items: GovernanceItem[];
}

export function GovernanceCards({ items }: GovernanceCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item) => {
        const Icon = resolveIcon(item.icon);
        return (
          <article
            key={item.title}
            className="bg-card border border-card-border rounded-xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {item.title}
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
