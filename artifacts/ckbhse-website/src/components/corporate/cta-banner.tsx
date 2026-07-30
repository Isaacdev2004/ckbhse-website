import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@workspace/ui/components/button';
import { SectionReveal } from '@/components/section-reveal';
import { PageContainer } from '@/components/page-container';

interface CtaBannerProps {
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
}

export function CtaBanner({
  title,
  description,
  buttonLabel,
  buttonHref,
}: CtaBannerProps) {
  return (
    <SectionReveal className="py-24 bg-muted/30">
      <PageContainer variant="narrow" className="text-center">
        <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6">
          {title}
        </h2>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          {description}
        </p>
        <Link href={buttonHref}>
          <Button size="lg" className="font-semibold group">
            {buttonLabel}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </PageContainer>
    </SectionReveal>
  );
}
