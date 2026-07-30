import type { BeforeAfterComparison } from '@workspace/content/schemas';

interface BeforeAfterComparisonProps {
  items: BeforeAfterComparison[];
}

export function BeforeAfterComparisonBlock({
  items,
}: BeforeAfterComparisonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item) => (
        <article
          key={item.title}
          className="bg-card border border-card-border rounded-xl overflow-hidden"
        >
          <h3 className="font-display font-semibold text-lg px-6 pt-6 pb-2 text-foreground">
            {item.title}
          </h3>
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-6 bg-destructive/5">
              <p className="text-xs font-medium uppercase text-destructive mb-2">
                Before
              </p>
              <p className="text-sm text-muted-foreground">{item.before}</p>
            </div>
            <div className="p-6 bg-primary/5">
              <p className="text-xs font-medium uppercase text-primary mb-2">
                After
              </p>
              <p className="text-sm text-foreground">{item.after}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
