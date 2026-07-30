import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Download, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { createElement } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  SectionReveal,
  StaggerContainer,
  staggerItem,
} from '@/components/section-reveal';
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';
import { CtaBanner } from '@/components/corporate/cta-banner';
import { FaqAccordion } from '@/components/services/faq-accordion';
import { PageStructuredData } from '@/components/page-structured-data';
import { contentLoader } from '@/lib/content';
import {
  filterResourceCatalog,
  resolveHubResources,
} from '@workspace/content/resources/catalog';
import type { ResourceTypeId } from '@workspace/content/schemas';
import { RESOURCE_TYPE_LABELS } from '@workspace/content/schemas';
import { resolveIcon } from '@/lib/icons';
import { buildFaqSchema } from '@/lib/seo';

function useQueryParams() {
  const [location] = useLocation();
  return useMemo(
    () => new URLSearchParams(location.split('?')[1] ?? ''),
    [location],
  );
}

export default function Resources() {
  const content = contentLoader.getResourcesHubPage();
  const catalog = contentLoader.getResourceCatalog();
  const allResources = contentLoader.getResourcePages();
  const queryParams = useQueryParams();

  const initialType = queryParams.get('type') ?? 'all';
  const [activeType, setActiveType] = useState<string>(initialType);
  const [activeTopic, setActiveTopic] = useState('all');
  const [activeIndustry, setActiveIndustry] = useState('all');
  const [activeAuthor, setActiveAuthor] = useState('all');
  const [activeReadingTime, setActiveReadingTime] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCatalog = useMemo(
    () =>
      filterResourceCatalog(catalog, {
        type: activeType as ResourceTypeId | 'all',
        topic: activeTopic,
        industry: activeIndustry,
        author: activeAuthor,
        readingTime: activeReadingTime,
        query: searchQuery,
      }),
    [
      catalog,
      activeType,
      activeTopic,
      activeIndustry,
      activeAuthor,
      activeReadingTime,
      searchQuery,
    ],
  );

  const featuredResources = useMemo(
    () => resolveHubResources(allResources, content.featuredResources),
    [content.featuredResources, allResources],
  );

  const popularDownloads = useMemo(
    () => resolveHubResources(allResources, content.popularDownloads),
    [content.popularDownloads, allResources],
  );

  const regulatoryUpdates = useMemo(
    () => resolveHubResources(allResources, content.regulatoryUpdates),
    [content.regulatoryUpdates, allResources],
  );

  const webinarSpotlight = useMemo(
    () => resolveHubResources(allResources, content.webinarSpotlight),
    [content.webinarSpotlight, allResources],
  );

  const hubFaqSchema = useMemo(
    () => (content.faqs.length > 0 ? [buildFaqSchema(content.faqs)] : []),
    [content.faqs],
  );

  return (
    <PageShell
      seo={content.seo}
      path="/resources"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Resources', href: '/resources' },
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

      <SectionReveal className="py-12 bg-background">
        <PageContainer variant="narrow">
          <h2 className="font-display font-bold text-3xl text-foreground mb-4">
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

      {featuredResources.length > 0 && (
        <SectionReveal className="py-12 bg-muted/20">
          <PageContainer>
            <h2 className="font-display font-bold text-3xl text-foreground mb-8">
              Featured resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredResources.map((resource) => (
                <Link
                  key={resource.path}
                  href={resource.path}
                  className="group bg-card border border-card-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all"
                >
                  <span className="text-xs font-medium text-primary uppercase">
                    {RESOURCE_TYPE_LABELS[resource.type]}
                  </span>
                  <h3 className="font-display font-semibold text-xl text-foreground group-hover:text-primary mt-2 mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {resource.summary}
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
              placeholder="Search resources…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search knowledge centre"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveType('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${activeType === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              aria-pressed={activeType === 'all'}
            >
              All Types
            </button>
            {content.resourceTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setActiveType(type.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${activeType === type.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                aria-pressed={activeType === type.id}
              >
                {type.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTopic('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeTopic === 'all' ? 'bg-secondary text-secondary-foreground' : 'bg-muted/50 text-muted-foreground'}`}
              aria-pressed={activeTopic === 'all'}
            >
              All Topics
            </button>
            {content.topicFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveTopic(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeTopic === f.id ? 'bg-secondary text-secondary-foreground' : 'bg-muted/50 text-muted-foreground'}`}
                aria-pressed={activeTopic === f.id}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveAuthor('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeAuthor === 'all' ? 'bg-secondary text-secondary-foreground' : 'bg-muted/50 text-muted-foreground'}`}
              aria-pressed={activeAuthor === 'all'}
            >
              All Authors
            </button>
            {content.authorFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveAuthor(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeAuthor === f.id ? 'bg-secondary text-secondary-foreground' : 'bg-muted/50 text-muted-foreground'}`}
                aria-pressed={activeAuthor === f.id}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {content.industryFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveIndustry(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeIndustry === f.id ? 'bg-secondary text-secondary-foreground' : 'bg-muted/50 text-muted-foreground'}`}
                aria-pressed={activeIndustry === f.id}
              >
                {f.label}
              </button>
            ))}
            {content.readingTimeFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveReadingTime(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeReadingTime === f.id ? 'bg-secondary text-secondary-foreground' : 'bg-muted/50 text-muted-foreground'}`}
                aria-pressed={activeReadingTime === f.id}
              >
                {f.label}
              </button>
            ))}
          </div>
        </PageContainer>
      </div>

      <section className="py-16 bg-background" aria-live="polite">
        <PageContainer>
          <p className="text-sm text-muted-foreground mb-8">
            Showing {filteredCatalog.length} resource
            {filteredCatalog.length !== 1 ? 's' : ''}
          </p>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCatalog.map((item) => {
              const path = `/resources/${item.type}/${item.slug}`;
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
                      <span className="text-xs font-medium text-primary uppercase">
                        {RESOURCE_TYPE_LABELS[item.type]}
                      </span>
                      <h3 className="font-display font-semibold text-2xl text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    {item.author} · {item.readingTime}
                  </p>
                  <Link href={path}>
                    <Button variant="outline" className="w-full group">
                      View resource
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.article>
              );
            })}
          </StaggerContainer>
          {filteredCatalog.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No resources match your filters.
            </p>
          )}
        </PageContainer>
      </section>

      {regulatoryUpdates.length > 0 && (
        <SectionReveal className="py-16 bg-muted/20">
          <PageContainer>
            <h2 className="font-display font-bold text-3xl text-foreground mb-8">
              Latest regulatory updates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regulatoryUpdates.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="bg-card border border-card-border rounded-xl p-6 hover:border-primary/50 transition-colors"
                >
                  <h3 className="font-semibold text-foreground hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {item.summary}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {item.publishDate}
                  </p>
                </Link>
              ))}
            </div>
          </PageContainer>
        </SectionReveal>
      )}

      {webinarSpotlight.length > 0 && (
        <SectionReveal className="py-16 bg-background">
          <PageContainer>
            <h2 className="font-display font-bold text-3xl text-foreground mb-8">
              Webinar spotlight
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {webinarSpotlight.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="bg-card border border-card-border rounded-xl p-6 hover:border-primary/50 transition-colors"
                >
                  <h3 className="font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {item.summary}
                  </p>
                </Link>
              ))}
            </div>
          </PageContainer>
        </SectionReveal>
      )}

      {popularDownloads.length > 0 && (
        <SectionReveal className="py-16 bg-muted/20">
          <PageContainer variant="narrow">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-8 h-8 text-primary" aria-hidden="true" />
              <h2 className="font-display font-bold text-3xl text-foreground">
                {content.downloadCentre.title}
              </h2>
            </div>
            <p className="text-muted-foreground mb-8">
              {content.downloadCentre.description}
            </p>
            <ul className="space-y-3">
              {popularDownloads.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className="text-primary hover:underline font-medium"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </PageContainer>
        </SectionReveal>
      )}

      <SectionReveal className="py-16 bg-background">
        <PageContainer variant="narrow">
          <h2 className="font-display font-bold text-2xl text-foreground mb-4">
            Trending topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {content.trendingTopics.map((topic) => (
              <button
                key={topic.tag}
                type="button"
                onClick={() => setActiveTopic(topic.tag)}
                className="px-4 py-2 bg-muted rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {topic.label}
              </button>
            ))}
          </div>
        </PageContainer>
      </SectionReveal>

      <SectionReveal className="py-16 bg-muted/20">
        <PageContainer variant="narrow" className="text-center">
          <BookOpen
            className="w-12 h-12 mx-auto mb-4 text-primary"
            aria-hidden="true"
          />
          <h2 className="font-display font-bold text-3xl text-foreground mb-4">
            {content.newsletterCta.title}
          </h2>
          <p className="text-muted-foreground mb-6">
            {content.newsletterCta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              aria-label="Email for newsletter"
            />
            <Button variant="default">Subscribe</Button>
          </div>
        </PageContainer>
      </SectionReveal>

      <SectionReveal className="py-16 bg-background">
        <PageContainer variant="narrow">
          <FaqAccordion items={content.faqs} />
        </PageContainer>
      </SectionReveal>

      <CtaBanner
        title={content.consultationCta.title}
        description={content.consultationCta.description}
        buttonLabel={content.consultationCta.buttonLabel}
        buttonHref={content.consultationCta.buttonHref}
      />
    </PageShell>
  );
}
