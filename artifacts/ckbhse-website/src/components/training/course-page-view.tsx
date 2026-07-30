import { useMemo } from 'react';
import { Link } from 'wouter';
import type { CoursePageContent } from '@workspace/content/schemas';
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';
import { SectionReveal } from '@/components/section-reveal';
import { CtaBanner } from '@/components/corporate/cta-banner';
import { ServiceHero } from '@/components/services/service-hero';
import { FaqAccordion } from '@/components/services/faq-accordion';
import { RelatedServices } from '@/components/services/related-services';
import { CourseNavigation } from '@/components/training/course-navigation';
import { PageStructuredData } from '@/components/page-structured-data';
import { contentLoader } from '@/lib/content';
import {
  buildBreadcrumbListSchema,
  buildCanonicalUrl,
  buildCourseSchema,
  buildFaqSchema,
  getSeoSiteConfig,
} from '@/lib/seo';
import { PATHWAY_LEVEL_LABELS } from '@workspace/content/schemas';

interface CoursePageViewProps {
  page: CoursePageContent;
}

export function CoursePageView({ page }: CoursePageViewProps) {
  const services = contentLoader.resolveCourseServices(page);
  const relatedCourses = contentLoader.resolveRelatedCourses(page);
  const site = getSeoSiteConfig();

  const structuredData = useMemo(() => {
    const schemas: Record<string, unknown>[] = [
      buildCourseSchema({
        name: page.title,
        description: page.hero.description,
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
      <ServiceHero hero={page.hero} />

      <div className="py-16 bg-background">
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="lg:sticky lg:top-28">
                <CourseNavigation
                  activeCategory={page.category}
                  activeSlug={page.slug}
                />
              </div>
            </aside>

            <div className="lg:col-span-3 order-1 lg:order-2 space-y-16">
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                  {page.accreditation}
                </span>
                <span className="px-3 py-1 bg-muted rounded-lg text-sm font-medium text-foreground">
                  {PATHWAY_LEVEL_LABELS[page.level]}
                </span>
                <span className="px-3 py-1 bg-muted rounded-lg text-sm font-medium text-foreground">
                  {page.duration}
                </span>
                <span className="px-3 py-1 bg-secondary/20 text-secondary-foreground rounded-lg text-sm font-medium">
                  {page.price}
                </span>
              </div>

              <section aria-labelledby="overview-heading">
                <h2
                  id="overview-heading"
                  className="font-display font-bold text-3xl text-foreground mb-6"
                >
                  Course overview
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
                  Learning objectives
                </h2>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  {page.learningObjectives.map((obj) => (
                    <li key={obj}>{obj}</li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="audience-heading">
                <h2
                  id="audience-heading"
                  className="font-display font-bold text-3xl text-foreground mb-6"
                >
                  Who is this course for?
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {page.targetAudience.map((audience) => (
                    <li
                      key={audience}
                      className="bg-card border border-card-border rounded-lg p-4 text-sm text-foreground"
                    >
                      {audience}
                    </li>
                  ))}
                </ul>
              </section>

              {page.prerequisites.length > 0 && (
                <section aria-labelledby="prerequisites-heading">
                  <h2
                    id="prerequisites-heading"
                    className="font-display font-bold text-3xl text-foreground mb-4"
                  >
                    Prerequisites
                  </h2>
                  <ul className="space-y-2 text-muted-foreground">
                    {page.prerequisites.map((req) => (
                      <li key={req}>• {req}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section aria-labelledby="delivery-heading">
                <h2
                  id="delivery-heading"
                  className="font-display font-bold text-3xl text-foreground mb-8"
                >
                  Delivery methods
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {page.deliveryMethods.map((method) => (
                    <article
                      key={method.id}
                      className="bg-card border border-card-border rounded-xl p-5"
                    >
                      <h3 className="font-semibold text-foreground mb-2">
                        {method.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section aria-labelledby="certification-heading">
                <h2
                  id="certification-heading"
                  className="font-display font-bold text-3xl text-foreground mb-6"
                >
                  Certification
                </h2>
                <article className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                  <h3 className="font-semibold text-foreground text-lg mb-2">
                    {page.certification.name}
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    {page.certification.description}
                  </p>
                  {page.certification.accreditedBy && (
                    <p className="text-sm text-primary font-medium">
                      {page.certification.accreditedBy}
                    </p>
                  )}
                </article>
              </section>

              <section aria-labelledby="assessment-heading">
                <h2
                  id="assessment-heading"
                  className="font-display font-bold text-3xl text-foreground mb-4"
                >
                  Assessment
                </h2>
                <p className="text-muted-foreground">{page.assessment}</p>
              </section>

              <section aria-labelledby="outline-heading">
                <h2
                  id="outline-heading"
                  className="font-display font-bold text-3xl text-foreground mb-8"
                >
                  Course outline
                </h2>
                <div className="space-y-6">
                  {page.courseOutline.map((module) => (
                    <article
                      key={module.module}
                      className="border-l-2 border-primary pl-6"
                    >
                      <h3 className="font-semibold text-foreground mb-2">
                        {module.module}
                      </h3>
                      <ul className="space-y-1">
                        {module.topics.map((topic) => (
                          <li
                            key={topic}
                            className="text-sm text-muted-foreground"
                          >
                            • {topic}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>

              <section aria-labelledby="outcomes-heading">
                <h2
                  id="outcomes-heading"
                  className="font-display font-bold text-3xl text-foreground mb-6"
                >
                  Learning outcomes
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {page.learningOutcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="bg-muted/30 border border-border rounded-lg p-4 text-sm text-foreground"
                    >
                      {outcome}
                    </li>
                  ))}
                </ul>
              </section>

              {page.industries.length > 0 && (
                <section aria-labelledby="industries-heading">
                  <h2
                    id="industries-heading"
                    className="font-display font-bold text-3xl text-foreground mb-4"
                  >
                    Relevant industries
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {page.industries.map((industry) => (
                      <Link
                        key={industry.slug}
                        href={`/industries/${industry.slug}`}
                        className="px-3 py-1.5 bg-muted rounded-lg text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {industry.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <RelatedServices
                services={services}
                title="Related CKBHSE services"
              />

              {relatedCourses.length > 0 && (
                <section aria-labelledby="related-courses-heading">
                  <h2
                    id="related-courses-heading"
                    className="font-display font-bold text-3xl text-foreground mb-4"
                  >
                    Related courses
                  </h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedCourses.map((course) => (
                      <li key={course.path}>
                        <Link
                          href={course.path}
                          className="block bg-card border border-card-border rounded-xl p-5 hover:border-primary/50 transition-colors"
                        >
                          <h3 className="font-semibold text-foreground hover:text-primary">
                            {course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {course.hero.description}
                          </p>
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
