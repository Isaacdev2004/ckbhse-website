import type { SuccessMetric } from '@workspace/content/schemas';

interface KpiCardProps {
  metric: SuccessMetric;
}

export function KpiCard({ metric }: KpiCardProps) {
  return (
    <article className="bg-card border border-card-border rounded-xl p-6 text-center">
      <p className="text-3xl font-display font-bold text-primary mb-2">
        {metric.value}
      </p>
      <p className="font-semibold text-foreground mb-1">{metric.label}</p>
      {metric.description && (
        <p className="text-sm text-muted-foreground">{metric.description}</p>
      )}
      {metric.before && metric.after && (
        <p className="text-xs text-muted-foreground mt-3">
          {metric.before} → {metric.after}
        </p>
      )}
    </article>
  );
}
