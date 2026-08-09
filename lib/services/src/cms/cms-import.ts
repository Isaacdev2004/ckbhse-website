import type { ContentSource } from '@workspace/content/loader';
import type { CmsContentType } from '@workspace/domain/cms';

export interface CmsImportRecord {
  readonly contentType: CmsContentType;
  readonly slug: string;
  readonly path: string;
  readonly title: string;
  readonly category?: string | null;
  readonly segment?: string | null;
  readonly seo: Record<string, unknown>;
  readonly payload: Record<string, unknown>;
  readonly requiresClientApproval?: boolean;
}

function seoFromPayload(payload: { seo?: Record<string, unknown> }): Record<string, unknown> {
  return payload.seo ?? {};
}

function hubRecord(
  slug: string,
  path: string,
  title: string,
  payload: Record<string, unknown>,
): CmsImportRecord {
  return {
    contentType: 'hub',
    slug,
    path,
    title,
    seo: seoFromPayload(payload),
    payload,
  };
}

export function collectCmsImportRecords(source: ContentSource): CmsImportRecord[] {
  const records: CmsImportRecord[] = [];

  records.push({
    contentType: 'site_config',
    slug: 'site-config',
    path: '/__site-config__',
    title: 'Site configuration',
    seo: {},
    payload: source.getSiteConfig() as Record<string, unknown>,
  });

  const home = source.getHomePage();
  records.push({
    contentType: 'home',
    slug: 'home',
    path: '/',
    title: home.hero.title,
    seo: seoFromPayload(home),
    payload: home as Record<string, unknown>,
  });

  records.push(
    hubRecord('services', '/services', 'Services', source.getServicesPage() as Record<string, unknown>),
    hubRecord('industries', '/industries', 'Industries', source.getIndustriesPage() as Record<string, unknown>),
    hubRecord('training', '/training', 'Training', source.getTrainingPage() as Record<string, unknown>),
    hubRecord('knowledge', '/knowledge', 'Knowledge', source.getKnowledgePage() as Record<string, unknown>),
    hubRecord(
      'case-studies',
      '/case-studies',
      'Case studies',
      source.getCaseStudiesHubPage() as Record<string, unknown>,
    ),
    hubRecord(
      'testimonials',
      '/testimonials',
      'Testimonials',
      source.getTestimonialsHubPage() as Record<string, unknown>,
    ),
    hubRecord(
      'client-success',
      '/client-success',
      'Client success',
      source.getClientSuccessHubPage() as Record<string, unknown>,
    ),
    hubRecord('careers', '/careers', 'Careers', source.getCareersPage() as Record<string, unknown>),
    hubRecord('faq', '/faq', 'FAQ', source.getFaqPage() as Record<string, unknown>),
    hubRecord('contact', '/contact', 'Contact', source.getContactPage() as Record<string, unknown>),
  );

  for (const page of source.getCorporatePages()) {
    records.push({
      contentType: 'corporate',
      slug: page.slug,
      path: page.path,
      title: page.hero.title,
      seo: seoFromPayload(page),
      payload: page as Record<string, unknown>,
    });
  }

  for (const page of source.getServicePages()) {
    records.push({
      contentType: 'service',
      slug: page.slug,
      path: page.path,
      title: page.title,
      category: page.category,
      seo: seoFromPayload(page),
      payload: page as Record<string, unknown>,
    });
  }

  for (const page of source.getIndustryPages()) {
    records.push({
      contentType: 'industry',
      slug: page.slug,
      path: page.path,
      title: page.name,
      seo: seoFromPayload(page),
      payload: page as Record<string, unknown>,
    });
  }

  for (const page of source.getCoursePages()) {
    records.push({
      contentType: 'course',
      slug: page.slug,
      path: page.path,
      title: page.title,
      category: page.category,
      seo: seoFromPayload(page),
      payload: page as Record<string, unknown>,
    });
  }

  for (const page of source.getResourcePages()) {
    records.push({
      contentType: 'resource',
      slug: page.slug,
      path: page.path,
      title: page.title,
      category: page.type,
      seo: seoFromPayload(page),
      payload: page as Record<string, unknown>,
    });
  }

  for (const page of source.getCaseStudyPages()) {
    records.push({
      contentType: 'case_study',
      slug: page.slug,
      path: page.path,
      title: page.title,
      segment: page.industry,
      requiresClientApproval: true,
      seo: seoFromPayload(page),
      payload: page as Record<string, unknown>,
    });
  }

  for (const page of source.getTestimonialPages()) {
    records.push({
      contentType: 'testimonial',
      slug: page.slug,
      path: page.path,
      title: page.clientName ?? page.slug,
      requiresClientApproval: true,
      seo: seoFromPayload(page),
      payload: page as Record<string, unknown>,
    });
  }

  for (const page of source.getClientSuccessPages()) {
    records.push({
      contentType: 'client_success',
      slug: page.slug,
      path: page.path,
      title: page.title,
      seo: seoFromPayload(page),
      payload: page as Record<string, unknown>,
    });
  }

  const legalPages = [
    { slug: 'privacy-policy', path: '/privacy-policy', getter: source.getPrivacyPolicyPage() },
    { slug: 'terms-conditions', path: '/terms-conditions', getter: source.getTermsConditionsPage() },
    { slug: 'cookie-policy', path: '/cookie-policy', getter: source.getCookiePolicyPage() },
    {
      slug: 'accessibility-statement',
      path: '/legal/accessibility',
      getter: source.getAccessibilityStatementPage(),
    },
  ] as const;

  for (const legal of legalPages) {
    records.push({
      contentType: 'legal',
      slug: legal.slug,
      path: legal.path,
      title: legal.getter.title,
      seo: seoFromPayload(legal.getter),
      payload: legal.getter as Record<string, unknown>,
    });
  }

  return records;
}
