import { useMemo } from 'react';
import { Link } from 'wouter';
import { Download, CheckCircle2 } from 'lucide-react';
import type { CaseStudyPageContent } from '@workspace/content/schemas';
import { PROJECT_TYPE_LABELS, CASE_STUDY_INDUSTRY_LABELS } from '@workspace/content/schemas';
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';
import { ServiceHero } from '@/components/services/service-hero';
import { FaqAccordion } from '@/components/services/faq-accordion';
import { RelatedServices } from '@/components/services/related-services';
import { PageStructuredData } from '@/components/page-structured-data';
import { KpiCard } from '@/components/trust/kpi-card';
import { TestimonialCard } from '@/components/trust/testimonial-card';
import { ConsultationBanner } from '@/components/trust/consultation-banner';
import { contentLoader } from '@/lib/content';
import {
  buildBreadcrumbListSchema,
  buildCanonicalUrl,
  buildCaseStudySchema,
  buildCreativeWorkSchema,
  buildFaqSchema,
} from '@/lib/seo';

interface CaseStudyPageViewProps {
  page: CaseStudyPageContent;
}

export function CaseStudyPageView({ page }: CaseStudyPageViewProps) {
  const services = contentLoader.resolveCaseStudyServices(page);
  const courses = contentLoader.resolveCaseStudyCourses(page);
  const resources = contentLoader.resolveCaseStudyResources(page);
  const related = contentLoader.resolveRelatedCaseStudies(page);
  const testimonial = page.testimonialReference
    ? contentLoader.getTestimonialPage(page.testimonialReference)
    : null;

  const structuredData = useMemo(() => {
    const url = buildCanonicalUrl(page.path);
    const base = {
      headline: page.title,
      description: page.overview,
      url,
      datePublished: page.publishDate,
    };
    const schemas: Record<string, unknown>[] = [
      buildCaseStudySchema(base),
      buildCreativeWorkSchema({
        name: page.title,
        description: page.overview,
        url,
      }),
      buildBreadcrumbListSchema(page.breadcrumbs),
    ];
    if (page.faqs.length > 0) schemas.push(buildFaqSchema(page.faqs));
    return schemas;
  }, [page]);

  return (
    <PageShell seo={page.seo} path={page.path} breadcrumbs={page.breadcrumbs} withNavOffset={false}>
      <PageStructuredData data={structuredData} />
      <ServiceHero
        hero={{
          badge: CASE_STUDY_INDUSTRY_LABELS[page.industry],
          title: page.title,
          description: page.subtitle,
        }}
      />

      <PageContainer className="py-16 space-y-16">
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
            {PROJECT_TYPE_LABELS[page.projectType]}
          </span>
          <span className="px-3 py-1 bg-muted rounded-lg text-sm">{page.timeline}</span>
          <span className="px-3 py-1 bg-muted rounded-lg text-sm">{page.clientProfile}</span>
        </div>

        <section aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="font-display font-bold text-3xl mb-4">Overview</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">{page.overview}</p>
        </section>

        <section aria-labelledby="metrics-heading">
          <h2 id="metrics-heading" className="font-display font-bold text-3xl mb-6">Key outcomes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {page.keyStatistics.map((stat) => (
              <div key={stat.label} className="bg-card border border-card-border rounded-xl p-4 text-center">
                <p className="text-2xl font-display font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {page.outcomeMetrics.map((m) => (
              <KpiCard key={m.label} metric={m} />
            ))}
          </div>
        </section>

        <section aria-labelledby="challenge-heading">
          <h2 id="challenge-heading" className="font-display font-bold text-3xl mb-4">Challenge</h2>
          <p className="text-muted-foreground leading-relaxed">{page.challenge}</p>
        </section>

        <section aria-labelledby="methodology-heading">
          <h2 id="methodology-heading" className="font-display font-bold text-3xl mb-4">Methodology</h2>
          <ul className="space-y-2">
            {page.methodology.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="results-heading">
          <h2 id="results-heading" className="font-display font-bold text-3xl mb-4">Measurable results</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {page.measurableResults.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>

        {page.clientQuote && (
          <section aria-labelledby="quote-heading">
            <h2 id="quote-heading" className="font-display font-bold text-3xl mb-6">Client quote</h2>
            <blockquote className="border-l-4 border-primary pl-6 italic text-lg text-muted-foreground">
              &ldquo;{page.clientQuote.quote}&rdquo;
              <footer className="mt-4 not-italic text-sm text-foreground">
                — {page.clientQuote.author}, {page.clientQuote.role}, {page.clientQuote.company}
              </footer>
            </blockquote>
          </section>
        )}

        {testimonial && (
          <section aria-labelledby="testimonial-heading">
            <h2 id="testimonial-heading" className="font-display font-bold text-3xl mb-6">Verified testimonial</h2>
            <TestimonialCard testimonial={testimonial} />
          </section>
        )}

        {page.downloadableSummary && (
          <section aria-labelledby="download-heading">
            <h2 id="download-heading" className="font-display font-bold text-3xl mb-4">Download summary</h2>
            <a
              href={page.downloadableSummary.url}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
            >
              <Download className="w-5 h-5" aria-hidden />
              {page.downloadableSummary.name}
            </a>
          </section>
        )}

        {services.length > 0 && <RelatedServices services={services} />}

        {courses.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-2xl mb-4">Related training</h2>
            <ul className="space-y-2">
              {courses.map((c) => (
                <li key={c.path}>
                  <Link href={c.path} className="text-primary hover:underline">{c.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {resources.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-2xl mb-4">Related resources</h2>
            <ul className="space-y-2">
              {resources.map((r) => (
                <li key={r.path}>
                  <Link href={r.path} className="text-primary hover:underline">{r.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-2xl mb-4">Related case studies</h2>
            <ul className="space-y-2">
              {related.map((cs) => (
                <li key={cs.path}>
                  <Link href={cs.path} className="text-primary hover:underline">{cs.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <FaqAccordion items={page.faqs} />
      </PageContainer>

      <ConsultationBanner
        title={page.cta.title}
        description={page.cta.description}
        buttonLabel={page.cta.buttonLabel}
        buttonHref={page.cta.buttonHref}
        action={page.cta.action}
      />
    </PageShell>
  );
}
