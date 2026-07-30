import { useRoute } from 'wouter';
import { contentLoader } from '@/lib/content';
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';
import { PageStructuredData } from '@/components/page-structured-data';
import { KpiCard } from '@/components/trust/kpi-card';
import { BeforeAfterComparisonBlock } from '@/components/trust/before-after';
import { TestimonialCard } from '@/components/trust/testimonial-card';
import { ConsultationBanner } from '@/components/trust/consultation-banner';
import { FaqAccordion } from '@/components/services/faq-accordion';
import { buildBreadcrumbListSchema, buildFaqSchema } from '@/lib/seo';
import NotFound from '@/pages/not-found';

export default function ClientSuccessStoryPage() {
  const [, params] = useRoute('/client-success/:slug');
  const page = params?.slug ? contentLoader.getClientSuccessPage(params.slug) : null;
  if (!page) return <NotFound />;

  const testimonials = contentLoader.resolveTestimonials(page.testimonialSlugs);
  const structuredData: Record<string, unknown>[] = [
    buildBreadcrumbListSchema(page.breadcrumbs),
  ];
  if (page.faqs.length > 0) structuredData.push(buildFaqSchema(page.faqs));

  return (
    <PageShell seo={page.seo} path={page.path} breadcrumbs={page.breadcrumbs}>
      <PageStructuredData data={structuredData} />
      <PageContainer className="py-16 space-y-16">
        <header>
          <h1 className="font-display font-bold text-4xl mb-4">{page.title}</h1>
          <p className="text-xl text-muted-foreground">{page.subtitle}</p>
        </header>
        <p className="text-lg leading-relaxed">{page.overview}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {page.statistics.map((s) => (
            <div key={s.label} className="text-center p-4 bg-card border rounded-xl">
              <p className="text-2xl font-display font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <BeforeAfterComparisonBlock items={page.beforeAfter} />
        <div className="grid md:grid-cols-3 gap-4">
          {page.outcomeMetrics.map((m) => (
            <KpiCard key={m.label} metric={m} />
          ))}
        </div>
        {testimonials.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-2xl mb-6">Client testimonials</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((t) => (
                <TestimonialCard key={t.slug} testimonial={t} compact />
              ))}
            </div>
          </section>
        )}
        <FaqAccordion items={page.faqs} />
      </PageContainer>
      <ConsultationBanner {...page.cta} />
    </PageShell>
  );
}
