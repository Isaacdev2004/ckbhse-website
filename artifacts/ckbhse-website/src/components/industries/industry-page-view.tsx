import { useMemo } from 'react';
import { Link } from 'wouter';
import type { IndustryPageContent } from '@workspace/content/schemas';
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';
import { SectionReveal } from '@/components/section-reveal';
import { StatisticGrid } from '@/components/corporate/statistic-grid';
import { CtaBanner } from '@/components/corporate/cta-banner';
import { ServiceHero } from '@/components/services/service-hero';
import { FaqAccordion } from '@/components/services/faq-accordion';
import { RelatedServices } from '@/components/services/related-services';
import { IndustryNavigation } from '@/components/industries/industry-navigation';
import { PageStructuredData } from '@/components/page-structured-data';
import { contentLoader } from '@/lib/content';
import {
  buildBreadcrumbListSchema,
  buildCanonicalUrl,
  buildFaqSchema,
  buildIndustryPageSchema,
} from '@/lib/seo';

interface IndustryPageViewProps {
  page: IndustryPageContent;
}

const severityStyles = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium:
    'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  low: 'bg-muted text-muted-foreground border-border',
};

export function IndustryPageView({ page }: IndustryPageViewProps) {
  const services = contentLoader.resolveApplicableServices(page);

  const structuredData = useMemo(() => {
    const schemas: Record<string, unknown>[] = [
      buildIndustryPageSchema({
        name: page.name,
        description: page.hero.description,
        url: buildCanonicalUrl(page.path),
      }),
      buildBreadcrumbListSchema(page.breadcrumbs),
    ];
    if (page.faqs.length > 0) {
      schemas.push(buildFaqSchema(page.faqs));
    }
    return schemas;
  }, [page]);

  return (
    <PageShell
      seo={page.seo}
      path={page.path}
      breadcrumbs={page.breadcrumbs}
      withNavOffset={false}
    >
      <PageStructuredData data={structuredData} />
      <ServiceHero hero={page.hero} />

      <div className="py-16 bg-background">
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="lg:sticky lg:top-28">
                <IndustryNavigation activeSlug={page.slug} />
              </div>
            </aside>

            <div className="lg:col-span-3 order-1 lg:order-2 space-y-16">
              <section aria-labelledby="overview-heading">
                <h2
                  id="overview-heading"
                  className="font-display font-bold text-3xl text-foreground mb-6"
                >
                  Why HSE matters in {page.name.toLowerCase()}
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

              {page.topics.length > 0 && (
                <section aria-labelledby="topics-heading">
                  <h2
                    id="topics-heading"
                    className="font-display font-bold text-3xl text-foreground mb-4"
                  >
                    Key topics
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {page.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-3 py-1.5 bg-muted rounded-lg text-sm font-medium text-foreground"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {page.industryStatistics &&
                page.industryStatistics.length > 0 && (
                  <section aria-labelledby="stats-heading">
                    <h2
                      id="stats-heading"
                      className="font-display font-bold text-3xl text-foreground mb-8"
                    >
                      Industry statistics
                    </h2>
                    <StatisticGrid items={page.industryStatistics} />
                  </section>
                )}

              <section aria-labelledby="challenges-heading">
                <h2
                  id="challenges-heading"
                  className="font-display font-bold text-3xl text-foreground mb-6"
                >
                  Industry challenges
                </h2>
                <ul className="space-y-3">
                  {page.challenges.map((challenge) => (
                    <li
                      key={challenge}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <span className="text-primary mt-1" aria-hidden="true">
                        •
                      </span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="regulatory-heading">
                <h2
                  id="regulatory-heading"
                  className="font-display font-bold text-3xl text-foreground mb-8"
                >
                  Regulatory framework
                </h2>
                <div className="space-y-4">
                  {page.regulatoryFramework.map((item) => (
                    <article
                      key={item.name}
                      className="bg-card border border-card-border rounded-xl p-6"
                    >
                      <h3 className="font-semibold text-foreground mb-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section aria-labelledby="risks-heading">
                <h2
                  id="risks-heading"
                  className="font-display font-bold text-3xl text-foreground mb-8"
                >
                  Common risks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {page.commonRisks.map((risk) => (
                    <article
                      key={risk.title}
                      className="bg-card border border-card-border rounded-xl p-5"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {risk.title}
                        </h3>
                        {risk.severity && (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded border ${severityStyles[risk.severity]}`}
                          >
                            {risk.severity}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {risk.description}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section aria-labelledby="compliance-heading">
                <h2
                  id="compliance-heading"
                  className="font-display font-bold text-3xl text-foreground mb-6"
                >
                  Compliance requirements
                </h2>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  {page.complianceRequirements.map((req) => (
                    <li key={req}>{req}</li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="documentation-heading">
                <h2
                  id="documentation-heading"
                  className="font-display font-bold text-3xl text-foreground mb-6"
                >
                  Required documentation
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {page.requiredDocumentation.map((doc) => (
                    <li
                      key={doc}
                      className="bg-muted/30 border border-border rounded-lg p-4 text-sm text-foreground"
                    >
                      {doc}
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="standards-heading">
                <h2
                  id="standards-heading"
                  className="font-display font-bold text-3xl text-foreground mb-6"
                >
                  Applicable standards
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {page.standards.map((standard) => (
                    <li
                      key={standard}
                      className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                    >
                      {standard}
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="methodology-heading">
                <h2
                  id="methodology-heading"
                  className="font-display font-bold text-3xl text-foreground mb-8"
                >
                  Our sector methodology
                </h2>
                <ol className="space-y-6">
                  {page.methodology.map((step) => (
                    <li
                      key={step.step}
                      className="flex gap-4 border-l-2 border-primary pl-6"
                    >
                      <span className="font-display font-bold text-primary">
                        {step.step}
                      </span>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <RelatedServices
                services={services}
                title="Applicable CKBHSE services"
              />

              {page.recommendedTraining.length > 0 && (
                <section aria-labelledby="training-heading">
                  <h2
                    id="training-heading"
                    className="font-display font-bold text-3xl text-foreground mb-4"
                  >
                    Recommended training
                  </h2>
                  <ul className="space-y-2">
                    {page.recommendedTraining.map((course) => (
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

              {(page.relevantCaseStudies?.length ?? 0) > 0 && (
                <section aria-labelledby="case-studies-heading">
                  <h2
                    id="case-studies-heading"
                    className="font-display font-bold text-3xl text-foreground mb-4"
                  >
                    Relevant case studies
                  </h2>
                  <ul className="space-y-2">
                    {page.relevantCaseStudies!.map((study) => (
                      <li key={study.slug}>
                        <Link
                          href={study.href}
                          className="text-primary hover:underline"
                        >
                          {study.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

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

              <FaqAccordion items={page.faqs} />
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
