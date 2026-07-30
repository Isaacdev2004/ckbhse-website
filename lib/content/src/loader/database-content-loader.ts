import type {
  CareersPageContent,
  HomePageContent,
  KnowledgePageContent,
  SiteConfig,
  TrainingPageContent,
} from '../schemas/pages.js';
import type {
  IndustryCatalogItem,
  IndustryPageContent,
  IndustriesPageContent,
} from '../schemas/industries.js';
import {
  industriesHubPageSchema,
  industryPageSchema,
} from '../schemas/industries.js';
import { toIndustryCatalogItem, resolveApplicableServices } from '../industries/catalog.js';
import type { ContactPageContent, LegalPageContent } from '../schemas/legal.js';
import type { CorporatePageContent } from '../schemas/corporate.js';
import type {
  ServiceCatalogItem,
  ServicePageContent,
  ServicesPageContent,
} from '../schemas/services.js';
import {
  careersPageSchema,
  homePageSchema,
  siteConfigSchema,
  caseStudiesHubPageSchema,
  testimonialsHubPageSchema,
  clientSuccessHubPageSchema,
} from '../schemas/pages.js';
import { servicesHubPageSchema, servicePageSchema } from '../schemas/services.js';
import { contactPageSchema, legalPageSchema } from '../schemas/legal.js';
import { corporatePageSchema } from '../schemas/corporate.js';
import { caseStudyPageSchema } from '../schemas/case-studies.js';
import {
  toCaseStudyCatalogItem,
  resolveRelatedCaseStudies,
  resolveCaseStudyServices,
  resolveCaseStudyCourses,
  resolveCaseStudyResources,
} from '../case-studies/catalog.js';
import type {
  CaseStudyCatalogItem,
  CaseStudyPageContent,
  CaseStudiesHubPageContent,
} from '../schemas/case-studies.js';
import { testimonialPageSchema } from '../schemas/testimonials.js';
import { toTestimonialCatalogItem, resolveRelatedTestimonials } from '../testimonials/catalog.js';
import type {
  TestimonialCatalogItem,
  TestimonialPageContent,
  TestimonialsHubPageContent,
} from '../schemas/testimonials.js';
import { clientSuccessPageSchema } from '../schemas/client-success.js';
import {
  toClientSuccessCatalogItem,
} from '../client-success/catalog.js';
import type {
  ClientSuccessCatalogItem,
  ClientSuccessPageContent,
  ClientSuccessHubPageContent,
} from '../schemas/client-success.js';
import type {
  TrainingCatalogItem,
  CoursePageContent,
} from '../schemas/training.js';
import { trainingHubPageSchema, coursePageSchema } from '../schemas/training.js';
import {
  resolveRelatedCourses,
  resolveRelatedServicesForCourse,
  toTrainingCatalogItem,
} from '../training/catalog.js';
import type {
  ResourceCatalogItem,
  ResourcePageContent,
} from '../schemas/resources.js';
import { resourcesHubPageSchema, resourcePageSchema } from '../schemas/resources.js';
import {
  resolveRelatedResources,
  resolveResourceCourses,
  resolveResourceServices,
  toResourceCatalogItem,
} from '../resources/catalog.js';
import { resolveRelatedServices, toCatalogItem } from '../services/catalog.js';
import type { ContentSource } from './index.js';
import type { CmsContentSnapshot, CmsSnapshotEntry } from '../snapshot/index.js';
import {
  filterSnapshotByType,
  indexSnapshotByPath,
} from '../snapshot/index.js';
import { validateContent } from './validate.js';
import type { z } from 'zod';

function payloadAt(
  byPath: Map<string, CmsSnapshotEntry>,
  path: string,
  label: string,
): Record<string, unknown> {
  const entry = byPath.get(path);
  if (!entry) {
    throw new Error(`CMS snapshot missing entry for ${label} (${path})`);
  }
  return entry.payload;
}

export class DatabaseContentLoader implements ContentSource {
  private readonly byPath: Map<string, CmsSnapshotEntry>;
  private readonly cache = new Map<string, unknown>();

  constructor(private readonly snapshot: CmsContentSnapshot) {
    this.byPath = indexSnapshotByPath(snapshot);
  }

  private cached<T>(key: string, factory: () => T): T {
    const existing = this.cache.get(key);
    if (existing !== undefined) {
      return existing as T;
    }
    const value = factory();
    this.cache.set(key, value);
    return value;
  }

  private pagesOf<T extends z.ZodType>(
    contentType: string,
    schema: T,
    label: string,
  ): z.infer<T>[] {
    return filterSnapshotByType(this.snapshot, contentType).map((entry) =>
      validateContent(schema, entry.payload, `${label}:${entry.path}`),
    );
  }

  getSiteConfig(): SiteConfig {
    return this.cached('site', () =>
      validateContent(
        siteConfigSchema,
        payloadAt(this.byPath, '/__site-config__', 'site config'),
        'site',
      ),
    );
  }

  getHomePage(): HomePageContent {
    return this.cached('home', () =>
      validateContent(
        homePageSchema,
        payloadAt(this.byPath, '/', 'home'),
        'home',
      ),
    );
  }

  getServicesPage(): ServicesPageContent {
    return this.cached('services', () =>
      validateContent(
        servicesHubPageSchema,
        payloadAt(this.byPath, '/services', 'services'),
        'services',
      ),
    );
  }

  getIndustriesPage(): IndustriesPageContent {
    return this.cached('industries', () =>
      validateContent(
        industriesHubPageSchema,
        payloadAt(this.byPath, '/industries', 'industries'),
        'industries',
      ),
    );
  }

  getTrainingPage(): TrainingPageContent {
    return this.cached('training', () =>
      validateContent(
        trainingHubPageSchema,
        payloadAt(this.byPath, '/training', 'training'),
        'training',
      ),
    );
  }

  getKnowledgePage(): KnowledgePageContent {
    return this.getResourcesHubPage();
  }

  getResourcesHubPage(): KnowledgePageContent {
    return this.cached('resources-hub', () => {
      const path = this.byPath.has('/resources')
        ? '/resources'
        : '/knowledge';
      return validateContent(
        resourcesHubPageSchema,
        payloadAt(this.byPath, path, 'resources'),
        'resources',
      );
    });
  }

  getCaseStudiesPage(): CaseStudiesHubPageContent {
    return this.getCaseStudiesHubPage();
  }

  getCaseStudiesHubPage(): CaseStudiesHubPageContent {
    return this.cached('case-studies-hub', () =>
      validateContent(
        caseStudiesHubPageSchema,
        payloadAt(this.byPath, '/case-studies', 'case-studies'),
        'case-studies',
      ),
    );
  }

  getCaseStudyPages(): CaseStudyPageContent[] {
    return this.cached('case-study-pages', () =>
      this.pagesOf('case_study', caseStudyPageSchema, 'case-study'),
    );
  }

  getCaseStudyPage(industry: string, slug: string): CaseStudyPageContent | null {
    return (
      this.getCaseStudyPages().find(
        (page) => page.industry === industry && page.slug === slug,
      ) ?? null
    );
  }

  getCaseStudyPageByPath(path: string): CaseStudyPageContent | null {
    return this.getCaseStudyPages().find((page) => page.path === path) ?? null;
  }

  getCaseStudyCatalog(): CaseStudyCatalogItem[] {
    return this.cached('case-study-catalog', () =>
      this.getCaseStudyPages().map(toCaseStudyCatalogItem),
    );
  }

  resolveRelatedCaseStudies(page: CaseStudyPageContent): CaseStudyPageContent[] {
    return resolveRelatedCaseStudies(
      this.getCaseStudyPages(),
      page.relatedCaseStudies ?? [],
    );
  }

  resolveCaseStudyServices(page: CaseStudyPageContent): ServicePageContent[] {
    return resolveCaseStudyServices(this.getServicePages(), page.relatedServices);
  }

  resolveCaseStudyCourses(page: CaseStudyPageContent): CoursePageContent[] {
    return resolveCaseStudyCourses(
      this.getCoursePages(),
      page.trainingDelivered ?? [],
    );
  }

  resolveCaseStudyResources(page: CaseStudyPageContent): ResourcePageContent[] {
    return resolveCaseStudyResources(
      this.getResourcePages(),
      page.relatedResources ?? [],
    );
  }

  getTestimonialPages(): TestimonialPageContent[] {
    return this.cached('testimonial-pages', () =>
      this.pagesOf('testimonial', testimonialPageSchema, 'testimonial'),
    );
  }

  getTestimonialPage(slug: string): TestimonialPageContent | null {
    return this.getTestimonialPages().find((page) => page.slug === slug) ?? null;
  }

  getTestimonialPageByPath(path: string): TestimonialPageContent | null {
    return this.getTestimonialPages().find((page) => page.path === path) ?? null;
  }

  getTestimonialCatalog(): TestimonialCatalogItem[] {
    return this.cached('testimonial-catalog', () =>
      this.getTestimonialPages().map(toTestimonialCatalogItem),
    );
  }

  getTestimonialsHubPage(): TestimonialsHubPageContent {
    return this.cached('testimonials-hub', () =>
      validateContent(
        testimonialsHubPageSchema,
        payloadAt(this.byPath, '/testimonials', 'testimonials'),
        'testimonials',
      ),
    );
  }

  resolveTestimonials(slugs: string[]): TestimonialPageContent[] {
    return resolveRelatedTestimonials(this.getTestimonialPages(), slugs);
  }

  getClientSuccessPages(): ClientSuccessPageContent[] {
    return this.cached('client-success-pages', () =>
      this.pagesOf('client_success', clientSuccessPageSchema, 'client-success'),
    );
  }

  getClientSuccessPage(slug: string): ClientSuccessPageContent | null {
    return this.getClientSuccessPages().find((page) => page.slug === slug) ?? null;
  }

  getClientSuccessPageByPath(path: string): ClientSuccessPageContent | null {
    return this.getClientSuccessPages().find((page) => page.path === path) ?? null;
  }

  getClientSuccessCatalog(): ClientSuccessCatalogItem[] {
    return this.cached('client-success-catalog', () =>
      this.getClientSuccessPages().map(toClientSuccessCatalogItem),
    );
  }

  getClientSuccessHubPage(): ClientSuccessHubPageContent {
    return this.cached('client-success-hub', () =>
      validateContent(
        clientSuccessHubPageSchema,
        payloadAt(this.byPath, '/client-success', 'client-success'),
        'client-success',
      ),
    );
  }

  getCareersPage(): CareersPageContent {
    return this.cached('careers', () =>
      validateContent(
        careersPageSchema,
        payloadAt(this.byPath, '/careers', 'careers'),
        'careers',
      ),
    );
  }

  getContactPage(): ContactPageContent {
    return this.cached('contact', () =>
      validateContent(
        contactPageSchema,
        payloadAt(this.byPath, '/contact', 'contact'),
        'contact',
      ),
    );
  }

  getPrivacyPolicyPage(): LegalPageContent {
    return this.cached('privacy-policy', () =>
      validateContent(
        legalPageSchema,
        payloadAt(this.byPath, '/privacy-policy', 'privacy-policy'),
        'privacy-policy',
      ),
    );
  }

  getTermsConditionsPage(): LegalPageContent {
    return this.cached('terms-conditions', () =>
      validateContent(
        legalPageSchema,
        payloadAt(this.byPath, '/terms-conditions', 'terms-conditions'),
        'terms-conditions',
      ),
    );
  }

  getCookiePolicyPage(): LegalPageContent {
    return this.cached('cookie-policy', () =>
      validateContent(
        legalPageSchema,
        payloadAt(this.byPath, '/cookie-policy', 'cookie-policy'),
        'cookie-policy',
      ),
    );
  }

  getAccessibilityStatementPage(): LegalPageContent {
    return this.cached('accessibility-statement', () =>
      validateContent(
        legalPageSchema,
        payloadAt(
          this.byPath,
          '/legal/accessibility',
          'accessibility-statement',
        ),
        'accessibility-statement',
      ),
    );
  }

  getCorporatePages(): CorporatePageContent[] {
    return this.cached('corporate-pages', () =>
      this.pagesOf('corporate', corporatePageSchema, 'corporate'),
    );
  }

  getCorporatePage(slug: string): CorporatePageContent | null {
    return this.getCorporatePages().find((page) => page.slug === slug) ?? null;
  }

  getCorporatePageByPath(path: string): CorporatePageContent | null {
    return this.getCorporatePages().find((page) => page.path === path) ?? null;
  }

  getServicePages(): ServicePageContent[] {
    return this.cached('service-pages', () =>
      this.pagesOf('service', servicePageSchema, 'service'),
    );
  }

  getServicePage(category: string, slug: string): ServicePageContent | null {
    return (
      this.getServicePages().find(
        (page) => page.category === category && page.slug === slug,
      ) ?? null
    );
  }

  getServicePageByPath(path: string): ServicePageContent | null {
    return this.getServicePages().find((page) => page.path === path) ?? null;
  }

  getServiceCatalog(): ServiceCatalogItem[] {
    return this.cached('service-catalog', () =>
      this.getServicePages().map(toCatalogItem),
    );
  }

  getServicesHubPage(): ServicesPageContent {
    return this.getServicesPage();
  }

  resolveRelatedServices(page: ServicePageContent): ServicePageContent[] {
    return resolveRelatedServices(this.getServicePages(), page.relatedServices);
  }

  getIndustryPages(): IndustryPageContent[] {
    return this.cached('industry-pages', () =>
      this.pagesOf('industry', industryPageSchema, 'industry'),
    );
  }

  getIndustryPage(slug: string): IndustryPageContent | null {
    return this.getIndustryPages().find((page) => page.slug === slug) ?? null;
  }

  getIndustryPageByPath(path: string): IndustryPageContent | null {
    return this.getIndustryPages().find((page) => page.path === path) ?? null;
  }

  getIndustryCatalog(): IndustryCatalogItem[] {
    return this.cached('industry-catalog', () =>
      this.getIndustryPages().map(toIndustryCatalogItem),
    );
  }

  getIndustriesHubPage(): IndustriesPageContent {
    return this.getIndustriesPage();
  }

  resolveApplicableServices(page: IndustryPageContent): ServicePageContent[] {
    return resolveApplicableServices(
      this.getServicePages(),
      page.applicableServices,
    );
  }

  getCoursePages(): CoursePageContent[] {
    return this.cached('course-pages', () =>
      this.pagesOf('course', coursePageSchema, 'course'),
    );
  }

  getCoursePage(category: string, slug: string): CoursePageContent | null {
    return (
      this.getCoursePages().find(
        (page) => page.category === category && page.slug === slug,
      ) ?? null
    );
  }

  getCoursePageByPath(path: string): CoursePageContent | null {
    return this.getCoursePages().find((page) => page.path === path) ?? null;
  }

  getTrainingCatalog(): TrainingCatalogItem[] {
    return this.cached('training-catalog', () =>
      this.getCoursePages().map(toTrainingCatalogItem),
    );
  }

  getTrainingHubPage(): TrainingPageContent {
    return this.getTrainingPage();
  }

  resolveRelatedCourses(page: CoursePageContent): CoursePageContent[] {
    return resolveRelatedCourses(this.getCoursePages(), page.relatedCourses ?? []);
  }

  resolveCourseServices(page: CoursePageContent): ServicePageContent[] {
    return resolveRelatedServicesForCourse(
      this.getServicePages(),
      page.relatedServices,
    );
  }

  getResourcePages(): ResourcePageContent[] {
    return this.cached('resource-pages', () =>
      this.pagesOf('resource', resourcePageSchema, 'resource'),
    );
  }

  getResourcePage(type: string, slug: string): ResourcePageContent | null {
    return (
      this.getResourcePages().find(
        (page) => page.type === type && page.slug === slug,
      ) ?? null
    );
  }

  getResourcePageByPath(path: string): ResourcePageContent | null {
    return this.getResourcePages().find((page) => page.path === path) ?? null;
  }

  getResourceCatalog(): ResourceCatalogItem[] {
    return this.cached('resource-catalog', () =>
      this.getResourcePages().map(toResourceCatalogItem),
    );
  }

  resolveRelatedResources(page: ResourcePageContent): ResourcePageContent[] {
    return resolveRelatedResources(
      this.getResourcePages(),
      page.relatedResources ?? [],
    );
  }

  resolveResourceServices(page: ResourcePageContent): ServicePageContent[] {
    return resolveResourceServices(this.getServicePages(), page.relatedServices);
  }

  resolveResourceCourses(page: ResourcePageContent): CoursePageContent[] {
    return resolveResourceCourses(this.getCoursePages(), page.relatedCourses ?? []);
  }
}
