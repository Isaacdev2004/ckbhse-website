import { createElement } from 'react';
import type { ValueCard as ValueCardContent } from '@workspace/content/schemas';
import { resolveIcon } from '@/lib/icons';

interface ValueCardProps {
  item: ValueCardContent;
}

export function ValueCard({ item }: ValueCardProps) {
  return (
    <article className="bg-card border border-card-border rounded-xl p-8 hover:shadow-lg hover:border-primary/40 transition-all h-full">
      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
        {createElement(resolveIcon(item.icon), {
          className: 'w-7 h-7 text-primary',
          'aria-hidden': true,
        })}
      </div>
      <h3 className="font-display font-semibold text-xl text-foreground mb-3">
        {item.title}
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-4">
        {item.description}
      </p>
      {item.supportingStatement && (
        <p className="text-sm text-foreground/80 border-t border-border pt-4">
          {item.supportingStatement}
        </p>
      )}
    </article>
  );
}
