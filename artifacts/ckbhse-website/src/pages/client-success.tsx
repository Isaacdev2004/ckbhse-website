import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';
import { FaqAccordion } from '@/components/services/faq-accordion';
import { PageStructuredData } from '@/components/page-structured-data';
import { KpiCard } from '@/components/trust/kpi-card';
import { BeforeAfterComparisonBlock } from '@/components/trust/before-after';
import { ClientLogosGrid } from '@/components/trust/client-logos-grid';
import { TestimonialCard } from '@/components/trust/testimonial-card';
import { ConsultationBanner } from '@/components/trust/consultation-banner';
import { Timeline } from '@/components/corporate/timeline';
import { contentLoader } from '@/lib/content';
import { resolveHubClientSuccessStories } from '@workspace/content/client-success/catalog';
import { buildCollectionPageSchema, buildCanonicalUrl, buildFaqSchema } from '@/lib/seo';

export default function ClientSuccess() {
  const content = contentLoader.getClientSuccessHubPage();
  const stories = resolveHubClientSuccessStories(
    contentLoader.getClientSuccessPages(),
    content.featuredStories,
  );
  const testimonials = contentLoader.resolveTestimonials(content.featuredTestimonials);

  const structuredData = [
    buildCollectionPageSchema({
      name: content.hero.title,
      description: content.hero.description,
      url: buildCanonicalUrl('/client-success'),
    }),
    buildFaqSchema(content.faqs),
  ];

  return (
    <PageShell seo={content.seo} path="/client-success">
      <PageStructuredData data={structuredData} />
      <section className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground py-24">
        <PageContainer>
          <h1 id="page-title" tabIndex={-1} className="font-display font-bold text-5xl mb-6 outline-none">{content.hero.title}</h1>
          <p className="text-xl opacity-90 max-w-3xl">{content.hero.description}</p>
        </PageContainer>
      </section>

      <section className="py-16 bg-background">
        <PageContainer>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {content.aggregateStatistics.map((s) => (
              <div key={s.label} className="text-center p-4 bg-card border border-card-border rounded-xl">
                <p className="text-3xl font-display font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <h2 className="font-display font-bold text-3xl mb-8">Outcome dashboard</h2>
          <div className="grid md:grid-cols-4 gap-4 mb-16">
            {content.outcomeDashboard.map((m) => (
              <KpiCard key={m.label} metric={m} />
            ))}
          </div>
          <h2 className="font-display font-bold text-3xl mb-8">Before & after</h2>
          <BeforeAfterComparisonBlock items={content.beforeAfterHighlights} />
        </PageContainer>
      </section>

      <section className="py-16 bg-muted/20">
        <PageContainer>
          <h2 className="font-display font-bold text-3xl mb-8">Success stories</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {stories.map((story) => (
              <article key={story.slug} className="bg-card border border-card-border rounded-xl p-8">
                <h3 className="font-display font-bold text-2xl mb-3">{story.title}</h3>
                <p className="text-muted-foreground mb-4">{story.overview}</p>
                <Link href={story.path}><Button variant="outline" className="group">View story<ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></Button></Link>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-16 bg-background">
        <PageContainer>
          <h2 className="font-display font-bold text-3xl mb-8">Client testimonials</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.slug} testimonial={t} compact />
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-16 bg-muted/10">
        <PageContainer>
          <ClientLogosGrid logos={content.clientLogos} />
          <div className="mt-12"><Timeline items={content.successTimeline} /></div>
        </PageContainer>
      </section>

      <section className="py-16 bg-background">
        <PageContainer variant="narrow"><FaqAccordion items={content.faqs} /></PageContainer>
      </section>
      <ConsultationBanner {...content.consultationCta} />
    </PageShell>
  );
}
