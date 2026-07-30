import { useMemo } from 'react';
import { useRoute } from 'wouter';
import { contentLoader } from '@/lib/content';
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';
import { PageStructuredData } from '@/components/page-structured-data';
import { ConsultationBanner } from '@/components/trust/consultation-banner';
import { buildBreadcrumbListSchema, buildCanonicalUrl, buildReviewSchema } from '@/lib/seo';
import NotFound from '@/pages/not-found';

export default function TestimonialPage() {
  const [, params] = useRoute('/testimonials/:slug');
  const page = params?.slug ? contentLoader.getTestimonialPage(params.slug) : null;

  const structuredData = useMemo(() => {
    if (!page) return [];
    return [
      buildReviewSchema({
        author: page.clientName,
        reviewBody: page.testimonial,
        ratingValue: page.rating,
        itemReviewed: page.company,
        url: buildCanonicalUrl(page.path),
      }),
      buildBreadcrumbListSchema(page.breadcrumbs),
    ];
  }, [page]);

  if (!page) return <NotFound />;

  return (
    <PageShell seo={page.seo} path={page.path} breadcrumbs={page.breadcrumbs}>
      <PageStructuredData data={structuredData} />
      <PageContainer className="py-16 max-w-3xl">
        <blockquote className="text-2xl leading-relaxed text-foreground mb-8">&ldquo;{page.testimonial}&rdquo;</blockquote>
        <p className="font-semibold text-lg">{page.clientName}</p>
        <p className="text-muted-foreground">{page.role}, {page.company}</p>
        <p className="text-sm text-muted-foreground mt-2">{page.date}{page.location ? ` · ${page.location}` : ''}</p>
      </PageContainer>
      <ConsultationBanner title="Discuss your requirements" description="Speak to a CKBHSE consultant about achieving similar outcomes." buttonLabel="Book Consultation" buttonHref="/contact" action="book-consultation" />
    </PageShell>
  );
}
