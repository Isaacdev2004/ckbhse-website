import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@workspace/ui/components/button';
import type { ConversionAction } from '@workspace/content/schemas';

interface ConsultationBannerProps {
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  action?: ConversionAction;
}

export function ConsultationBanner({
  title,
  description,
  buttonLabel,
  buttonHref,
}: ConsultationBannerProps) {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
          {title}
        </h2>
        <p className="text-lg opacity-90 mb-8 leading-relaxed">{description}</p>
        <Link href={buttonHref}>
          <Button
            size="lg"
            variant="secondary"
            className="font-semibold group"
          >
            {buttonLabel}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
