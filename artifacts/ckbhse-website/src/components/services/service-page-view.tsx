import { useMemo } from 'react';
import type { ServicePageContent } from '@workspace/content/schemas';
import { Link } from 'wouter';
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';
import { SectionReveal } from '@/components/section-reveal';
import { FeatureGrid } from '@/components/corporate/feature-grid';
import { CtaBanner } from '@/components/corporate/cta-banner';
import { ServiceHero } from '@/components/services/service-hero';
import { FaqAccordion } from '@/components/services/faq-accordion';
import { RelatedServices } from '@/components/services/related-services';
import { ServiceNavigation } from '@/components/services/service-navigation';
import { PageStructuredData } from '@/components/page-structured-data';
import { contentLoader } from '@/lib/content';
import {
  buildBreadcrumbListSchema,
  buildCanonicalUrl,
  buildFaqSchema,
  buildServiceSchema,
  getSeoSiteConfig,
} from '@/lib/seo';

interface ServicePageViewProps {
  page: ServicePageContent;
}

export function ServicePageView({ page }: ServicePageViewProps) {
  const related = contentLoader.resolveRelatedServices(page);
  const site = getSeoSiteConfig();

  const structuredData = useMemo(() => {
    const schemas: Record<string, unknown>[] = [
      buildServiceSchema({
        name: page.title,
        description: page.summary,
        url: buildCanonicalUrl(page.path),
        providerName: site.siteName,
        providerUrl: site.siteUrl,
      }),
      buildBreadcrumbListSchema(page.breadcrumbs),
    ];
    if (page.faqs.length > 0) {
      schemas.push(buildFaqSchema(page.faqs));
    }
    return schemas;
  }, [page, site.siteName, site.siteUrl]);

  return (
    <PageShell
      seo={page.seo}
      path={page.path}
      breadcrumbs={page.breadcrumbs}
      withNavOffset={false}
    >
      <PageStructuredData data={structuredData} />
      <ServiceHero hero={page.hero} subtitle={page.subtitle} />

      <div className="py-16 bg-background">
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="lg:sticky lg:top-28">
                <ServiceNavigation
                  activeCategory={page.category}
                  activeSlug={page.slug}
                />
              </div>
            </aside>

            <div className="lg:col-span-3 order-1 lg:order-2 space-y-16">
              <section aria-labelledby="overview-heading">
                <h2
                  id="overview-heading"
                  className="font-display font-bold text-3xl text-foreground mb-6"
                >
                  Overview
                </h2>
                <div className="space-y-4">
                  {page.overview.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 48)}
                      className="text-lg text-muted-foreground leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>

              <section aria-labelledby="objectives-heading">
                <h2
                  id="objectives-heading"
                  className="font-display font-bold text-3xl text-foreground mb-6"
                >
                  Objectives
                </h2>
                <ul className="space-y-3 list-disc list-inside text-muted-foreground text-lg">
                  {page.objectives.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="benefits-heading">
                <h2
                  id="benefits-heading"
                  className="font-display font-bold text-3xl text-foreground mb-8"
                >
                  Key benefits
                </h2>
                <FeatureGrid items={page.keyBenefits} />
              </section>

              {page.industries.length > 0 && (
                <section aria-labelledby="industries-heading">
                  <h2
                    id="industries-heading"
                    className="font-display font-bold text-3xl text-foreground mb-6"
                  >
                    Industries we serve
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {page.industries.map((industry) => (
                      <Link
                        key={industry.slug}
                        href={`/industries/${industry.slug}`}
                        className="px-4 py-2 bg-muted rounded-lg text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {industry.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {page.regulations.length > 0 && (
                <section aria-labelledby="regulations-heading">
                  <h2
                    id="regulations-heading"
                    className="font-display font-bold text-3xl text-foreground mb-6"
                  >
                    Applicable regulations
                  </h2>
                  <ul className="bg-muted/30 border border-border rounded-xl p-6 space-y-2">
                    {page.regulations.map((reg) => (
                      <li
                        key={reg}
                        className="text-sm text-foreground flex items-start gap-2"
                      >
                        <span
                          className="text-primary mt-0.5"
                          aria-hidden="true"
                        >
                          •
                        </span>
                        {reg}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section aria-labelledby="methodology-heading">
                <h2
                  id="methodology-heading"
                  className="font-display font-bold text-3xl text-foreground mb-8"
                >
                  Our methodology
                </h2>
                <ol className="space-y-6">
                  {page.methodology.map((step) => (
                    <li
                      key={step.step}
                      className="flex gap-4 border-l-2 border-primary pl-6"
                    >
                      <span className="font-display font-bold text-primary text-lg">
                        {step.step}
                      </span>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section aria-labelledby="deliverables-heading">
                <h2
                  id="deliverables-heading"
                  className="font-display font-bold text-3xl text-foreground mb-6"
                >
                  Deliverables
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {page.deliverables.map((item) => (
                    <li
                      key={item}
                      className="bg-card border border-card-border rounded-lg p-4 text-sm text-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-muted-foreground">
                  <strong className="text-foreground">Typical timeline:</strong>{' '}
                  {page.timeline}
                </p>
              </section>

              <section aria-labelledby="results-heading">
                <h2
                  id="results-heading"
                  className="font-display font-bold text-3xl text-foreground mb-6"
                >
                  Expected results
                </h2>
                <ul className="space-y-2">
                  {page.expectedResults.map((result) => (
                    <li
                      key={result}
                      className="text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-primary" aria-hidden="true">
                        ✓
                      </span>
                      {result}
                    </li>
                  ))}
                </ul>
              </section>

              {page.testimonial && (
                <SectionReveal>
                  <figure className="bg-muted/30 border border-border rounded-xl p-8">
                    <blockquote className="text-xl text-foreground italic leading-relaxed">
                      &ldquo;{page.testimonial.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-4 text-sm text-muted-foreground">
                      — {page.testimonial.author}, {page.testimonial.role}
                    </figcaption>
                  </figure>
                </SectionReveal>
              )}

              {(page.relatedTraining?.length ?? 0) > 0 && (
                <section aria-labelledby="training-heading">
                  <h2
                    id="training-heading"
                    className="font-display font-bold text-3xl text-foreground mb-4"
                  >
                    Related training
                  </h2>
                  <ul className="space-y-2">
                    {page.relatedTraining!.map((course) => (
                      <li key={course.slug}>
                        <Link
                          href={course.href}
                          className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                        >
                          {course.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <FaqAccordion items={page.faqs} />
              <RelatedServices services={related} />
            </div>
          </div>
        </PageContainer>
      </div>

      <CtaBanner
        title={page.cta.title}
        description={page.cta.description}
        buttonLabel={page.cta.buttonLabel}
        buttonHref={page.cta.buttonHref}
      />
    </PageShell>
  );
}
