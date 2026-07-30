import type { StatItem } from '@workspace/content/schemas';
import { resolveIcon } from '@/lib/icons';

interface StatisticGridProps {
  items: StatItem[];
}

export function StatisticGrid({ items }: StatisticGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((stat) => {
        const Icon = resolveIcon(stat.icon);
        return (
          <div
            key={stat.label}
            className="text-center bg-card border border-card-border rounded-xl p-6"
          >
            <Icon
              className="w-8 h-8 text-primary mx-auto mb-3"
              aria-hidden="true"
            />
            <p className="font-display font-bold text-3xl text-foreground mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
