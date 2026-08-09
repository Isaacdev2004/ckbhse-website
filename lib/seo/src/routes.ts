import type { SeoFields } from '@workspace/content/schemas';
import { contentLoader } from '@workspace/content/loader';

export interface PublicRouteDefinition {
  path: string;
  /** Stable id for tests and future dynamic expansion. */
  id: string;
  indexable: boolean;
  getSeo: () => SeoFields;
}

const NOT_FOUND_SEO: SeoFields = {
  title: 'Page Not Found | CKBHSE Limited',
  description:
    'The page you requested could not be found on the CKBHSE Limited website.',
  noindex: true,
};

/** Canonical registry of current public routes — extend in P3+ without changing SEO architecture. */
export function getPublicRoutes(): PublicRouteDefinition[] {
  return [
    {
      id: 'home',
      path: '/',
      indexable: true,
      getSeo: () => contentLoader.getHomePage().seo,
    },
    {
      id: 'services',
      path: '/services',
      indexable: true,
      getSeo: () => contentLoader.getServicesPage().seo,
    },
    {
      id: 'industries',
      path: '/industries',
      indexable: true,
      getSeo: () => contentLoader.getIndustriesPage().seo,
    },
    {
      id: 'training',
      path: '/training',
      indexable: true,
      getSeo: () => contentLoader.getTrainingPage().seo,
    },
    {
      id: 'resources',
      path: '/resources',
      indexable: true,
      getSeo: () => contentLoader.getResourcesHubPage().seo,
    },
    {
      id: 'case-studies',
      path: '/case-studies',
      indexable: true,
      getSeo: () => contentLoader.getCaseStudiesHubPage().seo,
    },
    {
      id: 'testimonials',
      path: '/testimonials',
      indexable: true,
      getSeo: () => contentLoader.getTestimonialsHubPage().seo,
    },
    {
      id: 'client-success',
      path: '/client-success',
      indexable: true,
      getSeo: () => contentLoader.getClientSuccessHubPage().seo,
    },
    {
      id: 'careers',
      path: '/careers',
      indexable: true,
      getSeo: () => contentLoader.getCareersPage().seo,
    },
    {
      id: 'faq',
      path: '/faq',
      indexable: true,
      getSeo: () => contentLoader.getFaqPage().seo,
    },
    {
      id: 'contact',
      path: '/contact',
      indexable: true,
      getSeo: () => contentLoader.getContactPage().seo,
    },
    {
      id: 'privacy-policy',
      path: '/privacy-policy',
      indexable: true,
      getSeo: () => contentLoader.getPrivacyPolicyPage().seo,
    },
    {
      id: 'terms-conditions',
      path: '/terms-conditions',
      indexable: true,
      getSeo: () => contentLoader.getTermsConditionsPage().seo,
    },
    {
      id: 'cookie-policy',
      path: '/cookie-policy',
      indexable: true,
      getSeo: () => contentLoader.getCookiePolicyPage().seo,
    },
    {
      id: 'accessibility-statement',
      path: '/legal/accessibility',
      indexable: true,
      getSeo: () => contentLoader.getAccessibilityStatementPage().seo,
    },
    ...contentLoader.getCorporatePages().map((page) => ({
      id: page.slug,
      path: page.path,
      indexable: true as const,
      getSeo: () => page.seo,
    })),
    ...contentLoader.getServicePages().map((page) => ({
      id: `service-${page.category}-${page.slug}`,
      path: page.path,
      indexable: true as const,
      getSeo: () => page.seo,
    })),
    ...contentLoader.getIndustryPages().map((page) => ({
      id: `industry-${page.slug}`,
      path: page.path,
      indexable: true as const,
      getSeo: () => page.seo,
    })),
    ...contentLoader.getCoursePages().map((page) => ({
      id: `course-${page.category}-${page.slug}`,
      path: page.path,
      indexable: true as const,
      getSeo: () => page.seo,
    })),
    ...contentLoader.getResourcePages().map((page) => ({
      id: `resource-${page.type}-${page.slug}`,
      path: page.path,
      indexable: true as const,
      getSeo: () => page.seo,
    })),
    ...contentLoader.getCaseStudyPages().map((page) => ({
      id: `case-study-${page.industry}-${page.slug}`,
      path: page.path,
      indexable: true as const,
      getSeo: () => page.seo,
    })),
    ...contentLoader.getTestimonialPages().map((page) => ({
      id: `testimonial-${page.slug}`,
      path: page.path,
      indexable: true as const,
      getSeo: () => page.seo,
    })),
    ...contentLoader.getClientSuccessPages().map((page) => ({
      id: `client-success-${page.slug}`,
      path: page.path,
      indexable: true as const,
      getSeo: () => page.seo,
    })),
    {
      id: 'not-found',
      path: '/404',
      indexable: false,
      getSeo: () => NOT_FOUND_SEO,
    },
  ];
}

export function getIndexableRoutes(): PublicRouteDefinition[] {
  return getPublicRoutes().filter((route) => route.indexable);
}

export function getPrerenderRoutes(): PublicRouteDefinition[] {
  return getPublicRoutes().filter((route) => route.path !== '/404');
}
