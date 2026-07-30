import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { createElement } from 'react';
import type { ServicePageContent } from '@workspace/content/schemas';
import { resolveIcon } from '@/lib/icons';

interface RelatedServicesProps {
  services: ServicePageContent[];
  title?: string;
}

export function RelatedServices({
  services,
  title = 'Related services',
}: RelatedServicesProps) {
  if (services.length === 0) return null;

  return (
    <section aria-labelledby="related-services-heading">
      <h2
        id="related-services-heading"
        className="font-display font-bold text-3xl text-foreground mb-6"
      >
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Link
            key={service.path}
            href={service.path}
            className="group bg-card border border-card-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                {createElement(resolveIcon(service.icon), {
                  className: 'w-5 h-5 text-primary',
                  'aria-hidden': true,
                })}
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {service.summary}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary ml-auto flex-shrink-0 mt-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
