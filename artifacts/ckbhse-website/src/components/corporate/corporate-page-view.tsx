import type { CorporatePageContent } from '@workspace/content/schemas';
import { PageShell } from '@/components/page-shell';
import { CorporateHeroBanner } from '@/components/corporate/hero-banner';
import { CorporateSectionRenderer } from '@/components/corporate/corporate-section-renderer';
import { CtaBanner } from '@/components/corporate/cta-banner';

interface CorporatePageViewProps {
  page: CorporatePageContent;
}

export function CorporatePageView({ page }: CorporatePageViewProps) {
  const hasInlineCta = page.sections.some((section) => section.type === 'cta');

  return (
    <PageShell
      seo={page.seo}
      path={page.path}
      breadcrumbs={page.breadcrumbs}
      withNavOffset={false}
    >
      <CorporateHeroBanner hero={page.hero} />
      {page.sections.map((section, index) => (
        <CorporateSectionRenderer key={index} section={section} />
      ))}
      {page.cta && !hasInlineCta && (
        <CtaBanner
          title={page.cta.title}
          description={page.cta.description}
          buttonLabel={page.cta.buttonLabel}
          buttonHref={page.cta.buttonHref}
        />
      )}
    </PageShell>
  );
}
