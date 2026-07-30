import { useMemo } from 'react';
import { Link } from 'wouter';
import { Download, Clock, Calendar } from 'lucide-react';
import type { ResourcePageContent } from '@workspace/content/schemas';
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';
import { CtaBanner } from '@/components/corporate/cta-banner';
import { ServiceHero } from '@/components/services/service-hero';
import { FaqAccordion } from '@/components/services/faq-accordion';
import { RelatedServices } from '@/components/services/related-services';
import { ResourceNavigation } from '@/components/resources/resource-navigation';
import { ResourceBody } from '@/components/resources/resource-body';
import { PageStructuredData } from '@/components/page-structured-data';
import { contentLoader } from '@/lib/content';
import {
  buildArticleSchema,
  buildBreadcrumbListSchema,
  buildCanonicalUrl,
  buildEventSchema,
  buildFaqSchema,
  buildNewsArticleSchema,
  getSeoSiteConfig,
} from '@/lib/seo';
import { RESOURCE_TYPE_LABELS } from '@workspace/content/schemas';

interface ResourcePageViewProps {
  page: ResourcePageContent;
}

export function ResourcePageView({ page }: ResourcePageViewProps) {
  const services = contentLoader.resolveResourceServices(page);
  const relatedResources = contentLoader.resolveRelatedResources(page);
  const relatedCourses = contentLoader.resolveResourceCourses(page);
  const site = getSeoSiteConfig();

  const structuredData = useMemo(() => {
    const url = buildCanonicalUrl(page.path);
    const base = {
      headline: page.title,
      description: page.summary,
      url,
      authorName: page.author,
      datePublished: page.publishDate,
      dateModified: page.updatedDate,
    };

    const primarySchema =
      page.type === 'news'
        ? buildNewsArticleSchema(base)
        : page.type === 'webinars' && page.webinar
          ? buildEventSchema({
              name: page.title,
              description: page.summary,
              url,
              ...(page.webinar.scheduledDate
                ? { startDate: page.webinar.scheduledDate }
                : {}),
              organizerName: site.siteName,
              organizerUrl: site.siteUrl,
            })
          : buildArticleSchema(base);

    const schemas: Record<string, unknown>[] = [
      primarySchema,
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
      <ServiceHero
        hero={{
          badge: RESOURCE_TYPE_LABELS[page.type],
          title: page.title,
          description: page.subtitle,
        }}
      />

      <div className="py-16 bg-background">
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="lg:sticky lg:top-28">
                <ResourceNavigation
                  activeType={page.type}
                  activeSlug={page.slug}
                />
              </div>
            </aside>

            <div className="lg:col-span-3 order-1 lg:order-2 space-y-12">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  {page.readingTime}
                </span>
                <span>{page.author}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  {page.publishDate}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {page.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-muted rounded-lg text-sm font-medium text-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {page.webinar && (
                <section
                  aria-labelledby="webinar-heading"
                  className="bg-primary/5 border border-primary/20 rounded-xl p-6"
                >
                  <h2
                    id="webinar-heading"
                    className="font-semibold text-foreground mb-2"
                  >
                    Webinar details
                  </h2>
                  <p className="text-sm text-muted-foreground capitalize mb-2">
                    Status: {page.webinar.status.replace('-', ' ')}
                  </p>
                  {page.webinar.scheduledDate && (
                    <p className="text-sm text-muted-foreground">
                      Date: {page.webinar.scheduledDate}
                    </p>
                  )}
                  {page.webinar.duration && (
                    <p className="text-sm text-muted-foreground">
                      Duration: {page.webinar.duration}
                    </p>
                  )}
                  {page.webinar.registrationUrl &&
                    page.webinar.status === 'upcoming' && (
                      <Link
                        href={page.webinar.registrationUrl}
                        className="inline-block mt-4 text-primary font-medium hover:underline"
                      >
                        Register interest
                      </Link>
                    )}
                </section>
              )}

              <ResourceBody blocks={page.body} />

              {(page.downloadableFiles?.length ?? 0) > 0 && (
                <section aria-labelledby="downloads-heading">
                  <h2
                    id="downloads-heading"
                    className="font-display font-bold text-2xl text-foreground mb-4"
                  >
                    Downloads
                  </h2>
                  <ul className="space-y-3">
                    {page.downloadableFiles!.map((file) => (
                      <li key={file.url}>
                        <a
                          href={file.url}
                          className="flex items-center gap-3 bg-card border border-card-border rounded-xl p-4 hover:border-primary/50 transition-colors"
                        >
                          <Download
                            className="w-5 h-5 text-primary flex-shrink-0"
                            aria-hidden="true"
                          />
                          <div>
                            <p className="font-medium text-foreground">
                              {file.name}
                            </p>
                            {file.description && (
                              <p className="text-sm text-muted-foreground">
                                {file.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground uppercase">
                              {file.fileType}
                            </p>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {page.industries.length > 0 && (
                <section aria-labelledby="industries-heading">
                  <h2
                    id="industries-heading"
                    className="font-display font-bold text-2xl text-foreground mb-4"
                  >
                    Relevant industries
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {page.industries.map((industry) => (
                      <Link
                        key={industry.slug}
                        href={`/industries/${industry.slug}`}
                        className="px-3 py-1.5 bg-muted rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
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
                <section aria-labelledby="courses-heading">
                  <h2
                    id="courses-heading"
                    className="font-display font-bold text-2xl text-foreground mb-4"
                  >
                    Related training
                  </h2>
                  <ul className="space-y-2">
                    {relatedCourses.map((course) => (
                      <li key={course.path}>
                        <Link
                          href={course.path}
                          className="text-primary hover:underline"
                        >
                          {course.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {relatedResources.length > 0 && (
                <section aria-labelledby="related-heading">
                  <h2
                    id="related-heading"
                    className="font-display font-bold text-2xl text-foreground mb-4"
                  >
                    Related resources
                  </h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedResources.map((resource) => (
                      <li key={resource.path}>
                        <Link
                          href={resource.path}
                          className="block bg-card border border-card-border rounded-xl p-5 hover:border-primary/50 transition-colors"
                        >
                          <h3 className="font-semibold text-foreground hover:text-primary">
                            {resource.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {resource.summary}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {page.references && page.references.length > 0 && (
                <section aria-labelledby="references-heading">
                  <h2
                    id="references-heading"
                    className="font-display font-bold text-2xl text-foreground mb-4"
                  >
                    References
                  </h2>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {page.references.map((ref) => (
                      <li key={ref.label}>
                        {ref.url ? (
                          <a
                            href={ref.url}
                            className="text-primary hover:underline"
                            rel="noopener noreferrer"
                          >
                            {ref.label}
                          </a>
                        ) : (
                          ref.label
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
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
