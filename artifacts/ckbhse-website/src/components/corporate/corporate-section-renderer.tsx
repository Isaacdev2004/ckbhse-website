import type { CorporateSection } from '@workspace/content/schemas';
import { SectionReveal } from '@/components/section-reveal';
import { PageContainer } from '@/components/page-container';
import { ValueCard } from '@/components/corporate/value-card';
import { Timeline } from '@/components/corporate/timeline';
import { LeadershipCard } from '@/components/corporate/leadership-card';
import { StatisticGrid } from '@/components/corporate/statistic-grid';
import { FeatureGrid } from '@/components/corporate/feature-grid';
import { AccreditationGrid } from '@/components/corporate/accreditation-grid';
import { PartnerGrid } from '@/components/corporate/partner-grid';
import { GovernanceCards } from '@/components/corporate/governance-cards';
import { QuoteBlock } from '@/components/corporate/quote-block';
import { CtaBanner } from '@/components/corporate/cta-banner';

interface CorporateSectionRendererProps {
  section: CorporateSection;
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string | undefined;
}) {
  return (
    <div className="mb-10">
      <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          {description}
        </p>
      )}
    </div>
  );
}

export function CorporateSectionRenderer({
  section,
}: CorporateSectionRendererProps) {
  switch (section.type) {
    case 'prose':
      return (
        <SectionReveal className="py-16 bg-background">
          <PageContainer variant="narrow">
            <SectionHeading title={section.title} />
            <div className="space-y-4">
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="text-muted-foreground leading-relaxed text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </PageContainer>
        </SectionReveal>
      );

    case 'values':
      return (
        <SectionReveal className="py-16 bg-muted/20">
          <PageContainer>
            <SectionHeading
              title={section.title}
              description={section.description}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item) => (
                <ValueCard key={item.title} item={item} />
              ))}
            </div>
          </PageContainer>
        </SectionReveal>
      );

    case 'timeline':
      return (
        <SectionReveal className="py-16 bg-background">
          <PageContainer variant="narrow">
            <SectionHeading title={section.title} />
            <Timeline items={section.items} />
          </PageContainer>
        </SectionReveal>
      );

    case 'stats':
      return (
        <SectionReveal className="py-16 bg-muted/20">
          <PageContainer>
            {section.title && <SectionHeading title={section.title} />}
            <StatisticGrid items={section.items} />
          </PageContainer>
        </SectionReveal>
      );

    case 'leadership':
      return (
        <SectionReveal className="py-16 bg-background">
          <PageContainer>
            <SectionHeading
              title={section.title}
              description={section.description}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.members.map((member) => (
                <LeadershipCard key={member.slug} member={member} />
              ))}
            </div>
          </PageContainer>
        </SectionReveal>
      );

    case 'features':
      return (
        <SectionReveal className="py-16 bg-background">
          <PageContainer>
            <SectionHeading
              title={section.title}
              description={section.description}
            />
            <FeatureGrid items={section.items} />
          </PageContainer>
        </SectionReveal>
      );

    case 'accreditations':
      return (
        <SectionReveal className="py-16 bg-muted/20">
          <PageContainer>
            <SectionHeading
              title={section.title}
              description={section.description}
            />
            <AccreditationGrid items={section.items} />
          </PageContainer>
        </SectionReveal>
      );

    case 'partners':
      return (
        <SectionReveal className="py-16 bg-background">
          <PageContainer>
            <SectionHeading
              title={section.title}
              description={section.description}
            />
            <PartnerGrid items={section.items} />
          </PageContainer>
        </SectionReveal>
      );

    case 'governance':
      return (
        <SectionReveal className="py-16 bg-background">
          <PageContainer>
            <SectionHeading
              title={section.title}
              description={section.description}
            />
            <GovernanceCards items={section.items} />
          </PageContainer>
        </SectionReveal>
      );

    case 'quote':
      return (
        <SectionReveal className="py-16 bg-muted/20">
          <PageContainer variant="narrow">
            <QuoteBlock text={section.text} attribution={section.attribution} />
          </PageContainer>
        </SectionReveal>
      );

    case 'list':
      return (
        <SectionReveal className="py-16 bg-background">
          <PageContainer variant="narrow">
            <SectionHeading title={section.title} />
            <ul className="space-y-3 list-disc list-inside text-muted-foreground text-lg leading-relaxed">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </PageContainer>
        </SectionReveal>
      );

    case 'cta':
      return (
        <CtaBanner
          title={section.title}
          description={section.description}
          buttonLabel={section.buttonLabel}
          buttonHref={section.buttonHref}
        />
      );

    default: {
      const _exhaustive: never = section;
      return _exhaustive;
    }
  }
}
