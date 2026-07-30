import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  SectionReveal,
  StaggerContainer,
  staggerItem,
} from '@/components/section-reveal';
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';
import { FeatureGrid } from '@/components/corporate/feature-grid';
import { CtaBanner } from '@/components/corporate/cta-banner';
import { FaqAccordion } from '@/components/services/faq-accordion';
import { contentLoader } from '@/lib/content';
import { filterServiceCatalog } from '@workspace/content/services/catalog';
import type { ServiceCategoryId } from '@workspace/content/schemas';
import { createElement } from 'react';
import { resolveIcon } from '@/lib/icons';
import { PageStructuredData } from '@/components/page-structured-data';
import { buildFaqSchema } from '@/lib/seo';

function useQueryParams() {
  const [location] = useLocation();
  return useMemo(
    () => new URLSearchParams(location.split('?')[1] ?? ''),
    [location],
  );
}

export default function Services() {
  const content = contentLoader.getServicesHubPage();
  const catalog = contentLoader.getServiceCatalog();
  const allPages = contentLoader.getServicePages();
  const queryParams = useQueryParams();

  const initialCategory = queryParams.get('category') ?? 'all';
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [activeIndustry, setActiveIndustry] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCatalog = useMemo(
    () =>
      filterServiceCatalog(catalog, {
        category: activeCategory as ServiceCategoryId | 'all',
        industry: activeIndustry,
        query: searchQuery,
      }),
    [catalog, activeCategory, activeIndustry, searchQuery],
  );

  const featuredPages = useMemo(
    () =>
      content.featuredServices
        .map((ref) =>
          allPages.find(
            (p) => p.category === ref.category && p.slug === ref.slug,
          ),
        )
        .filter((p): p is NonNullable<typeof p> => p !== undefined),
    [content.featuredServices, allPages],
  );

  const hubFaqSchema = useMemo(
    () => (content.faqs.length > 0 ? [buildFaqSchema(content.faqs)] : []),
    [content.faqs],
  );

  return (
    <PageShell
      seo={content.seo}
      path="/services"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/services' },
      ]}
      withNavOffset={false}
    >
      {hubFaqSchema.length > 0 && <PageStructuredData data={hubFaqSchema} />}

      <section className="bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 text-secondary-foreground py-24">
        <PageContainer>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
            className="max-w-4xl"
          >
            {content.hero.badge && (
              <p className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-4">
                {content.hero.badge}
              </p>
            )}
            <h1
              id="page-title"
              tabIndex={-1}
              className="font-display font-bold text-5xl md:text-6xl mb-6 outline-none"
            >
              {content.hero.title}
            </h1>
            <p className="text-xl opacity-90 leading-relaxed">
              {content.hero.description}
            </p>
          </motion.div>
        </PageContainer>
      </section>

      <SectionReveal className="py-16 bg-background">
        <PageContainer variant="narrow">
          <h2 className="font-display font-bold text-3xl text-foreground mb-6">
            {content.overview.title}
          </h2>
          {content.overview.paragraphs.map((p) => (
            <p
              key={p.slice(0, 40)}
              className="text-lg text-muted-foreground leading-relaxed mb-4"
            >
              {p}
            </p>
          ))}
        </PageContainer>
      </SectionReveal>

      {featuredPages.length > 0 && (
        <SectionReveal className="py-12 bg-muted/20">
          <PageContainer>
            <h2 className="font-display font-bold text-3xl text-foreground mb-8">
              Featured services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPages.map((service) => (
                <Link
                  key={service.path}
                  href={service.path}
                  className="group bg-card border border-card-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    {createElement(resolveIcon(service.icon), {
                      className: 'w-6 h-6 text-primary',
                      'aria-hidden': true,
                    })}
                  </div>
                  <h3 className="font-display font-semibold text-xl text-foreground group-hover:text-primary mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.summary}
                  </p>
                </Link>
              ))}
            </div>
          </PageContainer>
        </SectionReveal>
      )}

      <div className="bg-background border-b border-border sticky top-20 z-40">
        <PageContainer className="space-y-4 py-4">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search services…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search services"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                activeCategory === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              aria-pressed={activeCategory === 'all'}
            >
              All Services
            </button>
            {content.categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  activeCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                aria-pressed={activeCategory === category.id}
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveIndustry('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                activeIndustry === 'all'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-muted/50 text-muted-foreground'
              }`}
              aria-pressed={activeIndustry === 'all'}
            >
              All Industries
            </button>
            {content.industryFilters.map((industry) => (
              <button
                key={industry.id}
                type="button"
                onClick={() => setActiveIndustry(industry.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  activeIndustry === industry.id
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-muted/50 text-muted-foreground'
                }`}
                aria-pressed={activeIndustry === industry.id}
              >
                {industry.label}
              </button>
            ))}
          </div>
        </PageContainer>
      </div>

      <section className="py-16 bg-background" aria-live="polite">
        <PageContainer>
          <p className="text-sm text-muted-foreground mb-8">
            Showing {filteredCatalog.length} service
            {filteredCatalog.length !== 1 ? 's' : ''}
          </p>
          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredCatalog.map((item) => {
              const path = `/services/${item.category}/${item.slug}`;
              return (
                <motion.article
                  key={path}
                  variants={staggerItem}
                  className="bg-card border border-card-border rounded-xl p-8 hover:shadow-xl hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      {createElement(resolveIcon(item.icon), {
                        className: 'w-7 h-7 text-primary',
                        'aria-hidden': true,
                      })}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-2xl text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                  </div>
                  <Link href={path}>
                    <Button variant="outline" className="w-full group">
                      View Service Details
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.article>
              );
            })}
          </StaggerContainer>
          {filteredCatalog.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No services match your filters. Try adjusting your search or
              filters.
            </p>
          )}
        </PageContainer>
      </section>

      <SectionReveal className="py-16 bg-muted/20">
        <PageContainer>
          <FeatureGrid items={content.whyChoose.items} />
        </PageContainer>
      </SectionReveal>

      <SectionReveal className="py-16 bg-background">
        <PageContainer variant="narrow">
          <h2 className="font-display font-bold text-3xl text-foreground mb-4">
            {content.methodology.title}
          </h2>
          <p className="text-muted-foreground mb-8">
            {content.methodology.description}
          </p>
          <ol className="space-y-6">
            {content.methodology.steps.map((step) => (
              <li
                key={step.step}
                className="flex gap-4 border-l-2 border-primary pl-6"
              >
                <span className="font-display font-bold text-primary">
                  {step.step}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </PageContainer>
      </SectionReveal>

      <SectionReveal className="py-16 bg-muted/20">
        <PageContainer variant="narrow">
          <h2 className="font-display font-bold text-3xl text-foreground mb-8">
            {content.engagementProcess.title}
          </h2>
          <ol className="space-y-6">
            {content.engagementProcess.steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </PageContainer>
      </SectionReveal>

      <SectionReveal className="py-16 bg-background">
        <PageContainer variant="narrow">
          <FaqAccordion items={content.faqs} />
        </PageContainer>
      </SectionReveal>

      <CtaBanner
        title={content.retainerCta.title}
        description={content.retainerCta.description}
        buttonLabel={content.retainerCta.buttonLabel}
        buttonHref={content.retainerCta.buttonHref}
      />
    </PageShell>
  );
}
