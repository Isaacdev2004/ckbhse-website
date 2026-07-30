import { describe, expect, it, beforeEach } from 'vitest';
import { buildCanonicalUrl } from './canonical.js';
import { resetSeoSiteConfig, setSeoSiteConfig } from './config.js';
import { buildPageMetadata } from './metadata.js';
import { generateRobotsTxt } from './robots.js';
import { getIndexableRoutes, getPublicRoutes } from './routes.js';
import { generateSitemapXml } from './sitemap.js';
import { normalizePath, normalizeSlug } from './slug.js';
import {
  buildBreadcrumbListSchema,
  buildArticleSchema,
  buildCaseStudySchema,
  buildCollectionPageSchema,
  buildCourseSchema,
  buildCreativeWorkSchema,
  buildEventSchema,
  buildFaqSchema,
  buildIndustryPageSchema,
  buildNewsArticleSchema,
  buildReviewSchema,
  buildServiceSchema,
} from './schema/index.js';

beforeEach(() => {
  resetSeoSiteConfig();
  setSeoSiteConfig({
    siteUrl: 'https://www.ckbhse.co.uk',
    siteName: 'CKBHSE Limited',
    locale: 'en-GB',
    language: 'en',
    themeColor: '#0ea5c4',
    defaultOgImage: 'https://www.ckbhse.co.uk/og-default.svg',
  });
});

describe('canonical', () => {
  it('builds root and nested canonical URLs', () => {
    expect(buildCanonicalUrl('/')).toBe('https://www.ckbhse.co.uk');
    expect(buildCanonicalUrl('/services')).toBe(
      'https://www.ckbhse.co.uk/services',
    );
  });
});

describe('slug', () => {
  it('normalises slugs and paths', () => {
    expect(normalizeSlug('Health & Safety')).toBe('health-safety');
    expect(normalizePath('/services/')).toBe('/services');
    expect(normalizePath('/')).toBe('/');
  });
});

describe('metadata', () => {
  it('builds page metadata from content SEO fields', () => {
    const metadata = buildPageMetadata({
      path: '/services',
      seo: {
        title: 'Services | CKBHSE',
        description: 'HSEQ consultancy services.',
      },
    });

    expect(metadata.title).toBe('Services | CKBHSE');
    expect(metadata.canonical).toBe('https://www.ckbhse.co.uk/services');
    expect(metadata.robots).toBe('index, follow');
  });

  it('marks noindex pages correctly', () => {
    const metadata = buildPageMetadata({
      path: '/404',
      seo: {
        title: 'Not Found',
        description: 'Missing page',
        noindex: true,
      },
    });

    expect(metadata.robots).toBe('noindex, nofollow');
  });
});

describe('routes', () => {
  it('registers all current public pages including P8 client success routes', () => {
    const routes = getPublicRoutes();
    expect(routes.length).toBe(159);
    expect(getIndexableRoutes().length).toBe(158);
    expect(
      routes.some((r) => r.path === '/services/health-safety/risk-assessments'),
    ).toBe(true);
    expect(
      routes.some(
        (r) => r.path === '/case-studies/construction/cdm-london-development',
      ),
    ).toBe(true);
    expect(routes.some((r) => r.path === '/testimonials')).toBe(true);
    expect(routes.some((r) => r.path === '/client-success')).toBe(true);
    expect(routes.some((r) => r.path === '/knowledge')).toBe(false);
  });
});

describe('sitemap', () => {
  it('generates valid XML with indexable routes only', () => {
    const xml = generateSitemapXml({ lastmod: '2026-07-29' });
    expect(xml).toContain('<loc>https://www.ckbhse.co.uk/services</loc>');
    expect(xml).toContain('<loc>https://www.ckbhse.co.uk/about</loc>');
    expect(xml).toContain(
      '<loc>https://www.ckbhse.co.uk/services/health-safety/health-safety-audits</loc>',
    );
    expect(xml).toContain(
      '<loc>https://www.ckbhse.co.uk/industries/construction</loc>',
    );
    expect(xml).toContain(
      '<loc>https://www.ckbhse.co.uk/training/health-safety/iosh-managing-safely</loc>',
    );
    expect(xml).toContain(
      '<loc>https://www.ckbhse.co.uk/resources/articles/understanding-cdm-2015</loc>',
    );
    expect(xml).toContain('<loc>https://www.ckbhse.co.uk/resources</loc>');
    expect(xml).toContain(
      '<loc>https://www.ckbhse.co.uk/case-studies/construction/cdm-london-development</loc>',
    );
    expect(xml).toContain('<loc>https://www.ckbhse.co.uk/testimonials</loc>');
    expect(xml).not.toContain('/404');
  });
});

describe('course schema', () => {
  it('builds Course structured data for training pages', () => {
    const course = buildCourseSchema({
      name: 'IOSH Managing Safely',
      description: 'Management health and safety training.',
      url: 'https://www.ckbhse.co.uk/training/health-safety/iosh-managing-safely',
      providerName: 'CKBHSE Limited',
      providerUrl: 'https://www.ckbhse.co.uk',
    });
    expect(course['@type']).toBe('Course');
    expect(course.name).toBe('IOSH Managing Safely');
  });
});

describe('resource schema', () => {
  it('builds Article, NewsArticle, and Event structured data', () => {
    const article = buildArticleSchema({
      headline: 'Understanding CDM 2015',
      description: 'Practical CDM guidance.',
      url: 'https://www.ckbhse.co.uk/resources/articles/understanding-cdm-2015',
      authorName: 'CKBHSE Team',
      datePublished: '2024-01-15',
      dateModified: '2024-06-01',
    });
    expect(article['@type']).toBe('Article');

    const news = buildNewsArticleSchema({
      headline: 'HSE Fee for Intervention Update',
      description: 'Latest FFI changes.',
      url: 'https://www.ckbhse.co.uk/resources/news/hse-fee-for-intervention-update',
      authorName: 'CKBHSE Team',
      datePublished: '2024-03-01',
    });
    expect(news['@type']).toBe('NewsArticle');

    const event = buildEventSchema({
      name: 'CDM 2024 Update Briefing',
      description: 'Live webinar on CDM changes.',
      url: 'https://www.ckbhse.co.uk/resources/webinars/cdm-2024-update-briefing',
      startDate: '2024-09-15T10:00:00+01:00',
      eventStatus: 'EventScheduled',
      eventAttendanceMode: 'OnlineEventAttendanceMode',
      organizerName: 'CKBHSE Limited',
      organizerUrl: 'https://www.ckbhse.co.uk',
    });
    expect(event['@type']).toBe('Event');
  });

  it('builds case study, review, and collection page structured data', () => {
    const caseStudy = buildCaseStudySchema({
      headline: 'CDM London Development',
      description: 'Principal Designer services.',
      url: 'https://www.ckbhse.co.uk/case-studies/construction/cdm-london-development',
      datePublished: '2024',
    });
    expect(caseStudy['@type']).toBe('Article');

    const creative = buildCreativeWorkSchema({
      name: 'CDM London Development',
      description: 'Principal Designer services.',
      url: 'https://www.ckbhse.co.uk/case-studies/construction/cdm-london-development',
    });
    expect(creative['@type']).toBe('CreativeWork');

    const review = buildReviewSchema({
      author: 'James Hartley',
      reviewBody: 'Excellent CDM coordination.',
      ratingValue: 5,
      itemReviewed: 'London Development',
      url: 'https://www.ckbhse.co.uk/testimonials/construction-director-london',
    });
    expect(review['@type']).toBe('Review');

    const collection = buildCollectionPageSchema({
      name: 'Client Success',
      description: 'Measurable outcomes.',
      url: 'https://www.ckbhse.co.uk/client-success',
    });
    expect(collection['@type']).toBe('CollectionPage');
  });
});

describe('industry schema', () => {
  it('builds WebPage structured data for industry pages', () => {
    const page = buildIndustryPageSchema({
      name: 'Construction',
      description: 'HSE consultancy for UK construction.',
      url: 'https://www.ckbhse.co.uk/industries/construction',
    });
    expect(page['@type']).toBe('WebPage');
    expect(page.name).toBe('Construction');
  });
});

describe('service schema', () => {
  it('builds Service and FAQ structured data', () => {
    const service = buildServiceSchema({
      name: 'Health & Safety Audits',
      description: 'Workplace H&S audits.',
      url: 'https://www.ckbhse.co.uk/services/health-safety/health-safety-audits',
      providerName: 'CKBHSE Limited',
      providerUrl: 'https://www.ckbhse.co.uk',
    });
    expect(service['@type']).toBe('Service');

    const faq = buildFaqSchema([
      { question: 'How quickly?', answer: 'Within 5–10 days.' },
    ]);
    expect(faq['@type']).toBe('FAQPage');
    expect(faq.mainEntity).toHaveLength(1);
  });
});

describe('robots', () => {
  it('allows production crawlers and references sitemap', () => {
    const txt = generateRobotsTxt({ environment: 'production' });
    expect(txt).toContain('Allow: /');
    expect(txt).toContain('Sitemap: https://www.ckbhse.co.uk/sitemap.xml');
  });

  it('blocks non-production by default', () => {
    const txt = generateRobotsTxt({ environment: 'development' });
    expect(txt).toContain('Disallow: /');
  });
});

describe('schema', () => {
  it('builds breadcrumb list with absolute URLs', () => {
    const schema = buildBreadcrumbListSchema([
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' },
    ]);

    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(2);
  });
});
