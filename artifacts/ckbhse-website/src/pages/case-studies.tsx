import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Search, ArrowRight } from 'lucide-react';
import { createElement } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';
import { FaqAccordion } from '@/components/services/faq-accordion';
import { PageStructuredData } from '@/components/page-structured-data';
import { KpiCard } from '@/components/trust/kpi-card';
import { ClientLogosGrid } from '@/components/trust/client-logos-grid';
import { ConsultationBanner } from '@/components/trust/consultation-banner';
import { Timeline } from '@/components/corporate/timeline';
import { contentLoader } from '@/lib/content';
import { filterCaseStudyCatalog, resolveHubCaseStudies } from '@workspace/content/case-studies/catalog';
import { CASE_STUDY_INDUSTRY_LABELS, PROJECT_TYPE_LABELS } from '@workspace/content/schemas';
import type { CaseStudyIndustryId } from '@workspace/content/schemas';
import { resolveIcon } from '@/lib/icons';
import { buildFaqSchema } from '@/lib/seo';

export default function CaseStudies() {
  const content = contentLoader.getCaseStudiesHubPage();
  const catalog = contentLoader.getCaseStudyCatalog();
  const allPages = contentLoader.getCaseStudyPages();
  const featured = resolveHubCaseStudies(allPages, content.featuredCaseStudies);

  const [activeIndustry, setActiveIndustry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCatalog = useMemo(
    () =>
      filterCaseStudyCatalog(catalog, {
        industry: activeIndustry as CaseStudyIndustryId | 'all',
        query: searchQuery,
      }),
    [catalog, activeIndustry, searchQuery],
  );

  const faqSchema = buildFaqSchema(content.faqs);

  return (
    <PageShell seo={content.seo} path="/case-studies">
      <PageStructuredData data={[faqSchema]} />
      <section className="bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 text-secondary-foreground py-24">
        <PageContainer>
          <p className="text-sm font-medium uppercase tracking-wide opacity-80 mb-3">{content.hero.badge}</p>
          <h1 id="page-title" tabIndex={-1} className="font-display font-bold text-5xl md:text-6xl mb-6 outline-none">{content.hero.title}</h1>
          <p className="text-xl opacity-90 max-w-3xl leading-relaxed">{content.hero.description}</p>
        </PageContainer>
      </section>

      <section className="py-12 bg-muted/20 border-b border-border">
        <PageContainer className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              placeholder="Search case studies…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search case studies"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setActiveIndustry('all')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeIndustry === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`} aria-pressed={activeIndustry === 'all'}>All Industries</button>
            {content.industryFilters.map((f) => (
              <button key={f.id} type="button" onClick={() => setActiveIndustry(f.id)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeIndustry === f.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`} aria-pressed={activeIndustry === f.id}>{f.label}</button>
            ))}
          </div>
        </PageContainer>
      </section>

      {featured.length > 0 && (
        <section className="py-16 bg-background">
          <PageContainer>
            <h2 className="font-display font-bold text-3xl mb-8">Featured case studies</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featured.map((study) => (
                <article key={study.path} className="bg-card border border-card-border rounded-xl p-8">
                  <p className="text-xs text-primary uppercase mb-2">{CASE_STUDY_INDUSTRY_LABELS[study.industry]}</p>
                  <h3 className="font-display font-bold text-2xl mb-3">{study.title}</h3>
                  <p className="text-muted-foreground mb-4">{study.overview}</p>
                  <Link href={study.path}><Button variant="outline" className="group">View case study<ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></Button></Link>
                </article>
              ))}
            </div>
          </PageContainer>
        </section>
      )}

      <section className="py-16 bg-muted/10" aria-live="polite">
        <PageContainer>
          <p className="text-sm text-muted-foreground mb-6">Showing {filteredCatalog.length} case studies</p>
          <div className="grid md:grid-cols-2 gap-8">
            {filteredCatalog.map((item) => {
              const path = `/case-studies/${item.industry}/${item.slug}`;
              return (
                <article key={path} className="bg-card border border-card-border rounded-xl p-8">
                  <div className="flex gap-4 mb-4">
                    {createElement(resolveIcon(item.icon), { className: 'w-8 h-8 text-primary', 'aria-hidden': true })}
                    <div>
                      <p className="text-xs text-primary uppercase">{CASE_STUDY_INDUSTRY_LABELS[item.industry]}</p>
                      <h3 className="font-display font-semibold text-xl">{item.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.clientProfile}</p>
                  <p className="text-muted-foreground mb-4">{item.summary}</p>
                  <p className="text-xs text-muted-foreground mb-4">{PROJECT_TYPE_LABELS[item.projectType]}</p>
                  <Link href={path}><Button variant="outline" className="w-full">View case study</Button></Link>
                </article>
              );
            })}
          </div>
        </PageContainer>
      </section>

      <section className="py-16 bg-background">
        <PageContainer>
          <h2 className="font-display font-bold text-3xl mb-8 text-center">Impact at a glance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {content.aggregateMetrics.map((m) => (
              <KpiCard key={m.label} metric={m} />
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-16 bg-muted/20">
        <PageContainer>
          <h2 className="font-display font-bold text-3xl mb-8">Trusted by leading organisations</h2>
          <ClientLogosGrid logos={content.clientLogos} />
        </PageContainer>
      </section>

      <section className="py-16 bg-background">
        <PageContainer>
          <Timeline items={content.successTimeline} />
        </PageContainer>
      </section>

      <section className="py-16 bg-muted/10">
        <PageContainer variant="narrow">
          <FaqAccordion items={content.faqs} />
        </PageContainer>
      </section>

      <ConsultationBanner {...content.consultationCta} />
    </PageShell>
  );
}
