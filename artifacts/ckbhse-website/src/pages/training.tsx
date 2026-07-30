import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, GraduationCap } from 'lucide-react';
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
import { FeatureGrid } from '@/components/corporate/feature-grid';
import { CtaBanner } from '@/components/corporate/cta-banner';
import { FaqAccordion } from '@/components/services/faq-accordion';
import { PageStructuredData } from '@/components/page-structured-data';
import { contentLoader } from '@/lib/content';
import { filterTrainingCatalog } from '@workspace/content/training/catalog';
import type {
  DeliveryMethodId,
  PathwayLevelId,
  TrainingCategoryId,
} from '@workspace/content/schemas';
import { PATHWAY_LEVEL_LABELS } from '@workspace/content/schemas';
import { resolveIcon } from '@/lib/icons';
import { buildFaqSchema } from '@/lib/seo';

function useQueryParams() {
  const [location] = useLocation();
  return useMemo(
    () => new URLSearchParams(location.split('?')[1] ?? ''),
    [location],
  );
}

export default function Training() {
  const content = contentLoader.getTrainingHubPage();
  const catalog = contentLoader.getTrainingCatalog();
  const allCourses = contentLoader.getCoursePages();
  const queryParams = useQueryParams();

  const initialCategory = queryParams.get('category') ?? 'all';
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [activeDelivery, setActiveDelivery] = useState('all');
  const [activeIndustry, setActiveIndustry] = useState('all');
  const [activeCertification, setActiveCertification] = useState('all');
  const [activeDuration, setActiveDuration] = useState('all');
  const [activePathway, setActivePathway] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCatalog = useMemo(
    () =>
      filterTrainingCatalog(catalog, {
        category: activeCategory as TrainingCategoryId | 'all',
        deliveryMethod: activeDelivery as DeliveryMethodId | 'all',
        industry: activeIndustry,
        certification: activeCertification,
        duration: activeDuration,
        pathwayLevel: activePathway as PathwayLevelId | 'all',
        query: searchQuery,
      }),
    [
      catalog,
      activeCategory,
      activeDelivery,
      activeIndustry,
      activeCertification,
      activeDuration,
      activePathway,
      searchQuery,
    ],
  );

  const featuredCourses = useMemo(
    () =>
      content.featuredCourses
        .map((ref) =>
          allCourses.find(
            (c) => c.category === ref.category && c.slug === ref.slug,
          ),
        )
        .filter((c): c is NonNullable<typeof c> => c !== undefined),
    [content.featuredCourses, allCourses],
  );

  const hubFaqSchema = useMemo(
    () => (content.faqs.length > 0 ? [buildFaqSchema(content.faqs)] : []),
    [content.faqs],
  );

  return (
    <PageShell
      seo={content.seo}
      path="/training"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Training', href: '/training' },
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

      {featuredCourses.length > 0 && (
        <SectionReveal className="py-12 bg-muted/20">
          <PageContainer>
            <h2 className="font-display font-bold text-3xl text-foreground mb-8">
              Featured courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <Link
                  key={course.path}
                  href={course.path}
                  className="group bg-card border border-card-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    {createElement(resolveIcon(course.icon), {
                      className: 'w-6 h-6 text-primary',
                      'aria-hidden': true,
                    })}
                  </div>
                  <h3 className="font-display font-semibold text-xl text-foreground group-hover:text-primary mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.hero.description}
                  </p>
                  <p className="text-sm font-medium text-primary mt-3">
                    {course.price}
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
              placeholder="Search courses…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search training courses"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                activeCategory === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
              aria-pressed={activeCategory === 'all'}
            >
              All Categories
            </button>
            {content.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
                aria-pressed={activeCategory === cat.id}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {content.deliveryMethodFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveDelivery(filter.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                  activeDelivery === filter.id
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-muted/50 text-muted-foreground'
                }`}
                aria-pressed={activeDelivery === filter.id}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveIndustry('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeIndustry === 'all' ? 'bg-secondary text-secondary-foreground' : 'bg-muted/50 text-muted-foreground'}`}
              aria-pressed={activeIndustry === 'all'}
            >
              All Industries
            </button>
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
          </div>
          <div className="flex flex-wrap gap-2">
            {content.certificationFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveCertification(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeCertification === f.id ? 'bg-secondary text-secondary-foreground' : 'bg-muted/50 text-muted-foreground'}`}
                aria-pressed={activeCertification === f.id}
              >
                {f.label}
              </button>
            ))}
            {content.durationFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveDuration(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeDuration === f.id ? 'bg-secondary text-secondary-foreground' : 'bg-muted/50 text-muted-foreground'}`}
                aria-pressed={activeDuration === f.id}
              >
                {f.label}
              </button>
            ))}
            {content.pathwayLevels.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActivePathway(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${activePathway === f.id ? 'bg-secondary text-secondary-foreground' : 'bg-muted/50 text-muted-foreground'}`}
                aria-pressed={activePathway === f.id}
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
            Showing {filteredCatalog.length} course
            {filteredCatalog.length !== 1 ? 's' : ''}
          </p>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCatalog.map((item) => {
              const path = `/training/${item.category}/${item.slug}`;
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
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
                      {item.accreditation}
                    </span>
                    <span className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">
                      {PATHWAY_LEVEL_LABELS[item.level]}
                    </span>
                    <span className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">
                      {item.duration}
                    </span>
                  </div>
                  <Link href={path}>
                    <Button variant="outline" className="w-full group">
                      View course
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.article>
              );
            })}
          </StaggerContainer>
          {filteredCatalog.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No courses match your filters.
            </p>
          )}
        </PageContainer>
      </section>

      <SectionReveal className="py-16 bg-muted/20">
        <PageContainer variant="narrow">
          <h2 className="font-display font-bold text-3xl text-foreground mb-4">
            {content.learningPathways.title}
          </h2>
          <p className="text-muted-foreground mb-8">
            {content.learningPathways.description}
          </p>
          <div className="space-y-8">
            {content.learningPathways.pathways.map((pathway, index) => (
              <article
                key={pathway.level}
                className="relative pl-8 border-l-2 border-primary"
              >
                <span className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-foreground text-lg">
                  {pathway.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {pathway.description}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {pathway.courses.map((ref) => {
                    const course = allCourses.find(
                      (c) => c.category === ref.category && c.slug === ref.slug,
                    );
                    if (!course) return null;
                    return (
                      <li key={course.path}>
                        <Link
                          href={course.path}
                          className="text-sm text-primary hover:underline"
                        >
                          {course.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>
        </PageContainer>
      </SectionReveal>

      <SectionReveal className="py-16 bg-background">
        <PageContainer>
          <h2 className="font-display font-bold text-3xl text-foreground mb-2">
            {content.whyTrain.title}
          </h2>
          {content.whyTrain.description && (
            <p className="text-muted-foreground mb-8">
              {content.whyTrain.description}
            </p>
          )}
          <FeatureGrid items={content.whyTrain.items} />
        </PageContainer>
      </SectionReveal>

      <SectionReveal className="py-16 bg-muted/20">
        <PageContainer variant="narrow">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap
              className="w-8 h-8 text-primary"
              aria-hidden="true"
            />
            <h2 className="font-display font-bold text-3xl text-foreground">
              {content.corporateTraining.title}
            </h2>
          </div>
          <p className="text-muted-foreground mb-8">
            {content.corporateTraining.description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.corporateTraining.offerings.map((offering) => (
              <article
                key={offering.title}
                className="bg-card border border-card-border rounded-xl p-6"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  {createElement(resolveIcon(offering.icon), {
                    className: 'w-5 h-5 text-primary',
                    'aria-hidden': true,
                  })}
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {offering.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {offering.description}
                </p>
              </article>
            ))}
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
