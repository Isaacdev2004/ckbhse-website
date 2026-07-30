import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';
import { FaqAccordion } from '@/components/services/faq-accordion';
import { PageStructuredData } from '@/components/page-structured-data';
import { TestimonialCard } from '@/components/trust/testimonial-card';
import { ConsultationBanner } from '@/components/trust/consultation-banner';
import { contentLoader } from '@/lib/content';
import { filterTestimonialCatalog, resolveHubTestimonials } from '@workspace/content/testimonials/catalog';
import { buildFaqSchema } from '@/lib/seo';

export default function Testimonials() {
  const content = contentLoader.getTestimonialsHubPage();
  const catalog = contentLoader.getTestimonialCatalog();
  const allPages = contentLoader.getTestimonialPages();
  const featured = resolveHubTestimonials(allPages, content.featuredTestimonials);

  const [activeIndustry, setActiveIndustry] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(
    () =>
      filterTestimonialCatalog(catalog, {
        industry: activeIndustry,
        query: searchQuery,
      }),
    [catalog, activeIndustry, searchQuery],
  );

  const filteredPages = filtered
    .map((item) => allPages.find((p) => p.slug === item.slug)!)
    .filter(Boolean);

  const faqSchema = buildFaqSchema(content.faqs);

  return (
    <PageShell seo={content.seo} path="/testimonials">
      <PageStructuredData data={[faqSchema]} />
      <section className="bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 text-secondary-foreground py-24">
        <PageContainer>
          <h1 id="page-title" tabIndex={-1} className="font-display font-bold text-5xl mb-6 outline-none">{content.hero.title}</h1>
          <p className="text-xl opacity-90 max-w-3xl">{content.hero.description}</p>
        </PageContainer>
      </section>

      <section className="py-12 bg-muted/20">
        <PageContainer className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden />
            <Input type="search" placeholder="Search testimonials…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" aria-label="Search testimonials" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setActiveIndustry('all')} className={`px-3 py-1.5 rounded-md text-xs ${activeIndustry === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>All</button>
            {content.industryFilters.map((f) => (
              <button key={f.id} type="button" onClick={() => setActiveIndustry(f.id)} className={`px-3 py-1.5 rounded-md text-xs ${activeIndustry === f.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{f.label}</button>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-16 bg-background">
        <PageContainer>
          <h2 className="font-display font-bold text-3xl mb-8">Featured testimonials</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {featured.map((t) => (
              <TestimonialCard key={t.slug} testimonial={t} compact />
            ))}
          </div>
          <ul className="flex flex-wrap gap-4 mb-12">
            {content.trustIndicators.map((indicator) => (
              <li key={indicator} className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium">{indicator}</li>
            ))}
          </ul>
          <div className="grid md:grid-cols-2 gap-6" aria-live="polite">
            {filteredPages.map((t) => (
              <TestimonialCard key={t.slug} testimonial={t} />
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-16 bg-muted/10">
        <PageContainer variant="narrow"><FaqAccordion items={content.faqs} /></PageContainer>
      </section>
      <ConsultationBanner {...content.consultationCta} />
    </PageShell>
  );
}
