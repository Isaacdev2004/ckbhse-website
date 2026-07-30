import type { TimelineItem } from '@workspace/content/schemas';

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <ol className="relative border-l border-border ml-4 space-y-10">
      {items.map((item) => (
        <li key={item.year} className="ml-8">
          <span
            className="absolute -left-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-primary ring-4 ring-background"
            aria-hidden="true"
          />
          <time
            dateTime={item.year}
            className="text-sm font-semibold text-primary uppercase tracking-wide"
          >
            {item.year}
          </time>
          <h3 className="font-display font-semibold text-lg text-foreground mt-1 mb-2">
            {item.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {item.description}
          </p>
        </li>
      ))}
    </ol>
  );
}
