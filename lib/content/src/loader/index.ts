import type {
  CareersPageContent,
  CaseStudiesPageContent,
  FaqPageContent,
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
import { industryPageRegistry } from '../data/industries/index.js';
import {
  resolveApplicableServices,
  toIndustryCatalogItem,
} from '../industries/catalog.js';
import type { ContactPageContent, LegalPageContent } from '../schemas/legal.js';
import type { CorporatePageContent } from '../schemas/corporate.js';
import type {
  ServiceCatalogItem,
  ServicePageContent,
  ServicesPageContent,
} from '../schemas/services.js';
import {
  careersPageSchema,
  faqPageSchema,
  homePageSchema,
  siteConfigSchema,
  caseStudiesHubPageSchema,
  testimonialsHubPageSchema,
  clientSuccessHubPageSchema,
} from '../schemas/pages.js';
import { servicesHubPageSchema } from '../schemas/services.js';
import { contactPageSchema, legalPageSchema } from '../schemas/legal.js';
import { corporatePageSchema } from '../schemas/corporate.js';
import { servicePageSchema } from '../schemas/services.js';
import { careersPageData } from '../data/careers.js';
import { faqPageData } from '../data/faq.js';
import { caseStudiesHubPageData } from '../data/case-studies/hub.js';
import { caseStudyPageRegistry } from '../data/case-studies/index.js';
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
import { testimonialsHubPageData } from '../data/testimonials/hub.js';
import { testimonialPageRegistry } from '../data/testimonials/index.js';
import { testimonialPageSchema } from '../schemas/testimonials.js';
import {
  toTestimonialCatalogItem,
  resolveRelatedTestimonials,
} from '../testimonials/catalog.js';
import type {
  TestimonialCatalogItem,
  TestimonialPageContent,
  TestimonialsHubPageContent,
} from '../schemas/testimonials.js';
import { clientSuccessHubPageData } from '../data/client-success/hub.js';
import { clientSuccessPageRegistry } from '../data/client-success/index.js';
import { clientSuccessPageSchema } from '../schemas/client-success.js';
import {
  toClientSuccessCatalogItem,
  resolveHubClientSuccessStories,
} from '../client-success/catalog.js';
import type {
  ClientSuccessCatalogItem,
  ClientSuccessPageContent,
  ClientSuccessHubPageContent,
} from '../schemas/client-success.js';
import { contactPageData } from '../data/contact.js';
import { homePageData } from '../data/home.js';
import { industriesPageData } from '../data/industries.js';
import {
  accessibilityStatementData,
  cookiePolicyData,
  privacyPolicyData,
  termsConditionsData,
} from '../data/legal/index.js';
import { knowledgePageData } from '../data/knowledge.js';
import { trainingPageData } from '../data/training.js';
import { servicesPageData } from '../data/services.js';
import { servicePageRegistry } from '../data/services/index.js';
import { resolveRelatedServices, toCatalogItem } from '../services/catalog.js';
import type {
  TrainingCatalogItem,
  CoursePageContent,
} from '../schemas/training.js';
import {
  trainingHubPageSchema,
  coursePageSchema,
} from '../schemas/training.js';
import { trainingPageRegistry } from '../data/training/index.js';
import {
  resolveRelatedCourses,
  resolveRelatedServicesForCourse,
  toTrainingCatalogItem,
} from '../training/catalog.js';
import type {
  ResourceCatalogItem,
  ResourcePageContent,
} from '../schemas/resources.js';
import {
  resourcesHubPageSchema,
  resourcePageSchema,
} from '../schemas/resources.js';
import { resourcePageRegistry } from '../data/resources/index.js';
import {
  resolveRelatedResources,
  resolveResourceCourses,
  resolveResourceServices,
  toResourceCatalogItem,
} from '../resources/catalog.js';
import { siteConfigData } from '../data/site.js';
import { corporatePageRegistry } from '../data/corporate/index.js';
import { validateContent } from './validate.js';

/**
 * CMS-ready content source contract.
 * File-backed today; swap implementation at M7 without changing consumers.
 */
export interface ContentSource {
  getSiteConfig(): SiteConfig;
  getHomePage(): HomePageContent;
  getServicesPage(): ServicesPageContent;
  getIndustriesPage(): IndustriesPageContent;
  getTrainingPage(): TrainingPageContent;
  getKnowledgePage(): KnowledgePageContent;
  getCaseStudiesPage(): CaseStudiesPageContent;
  getCareersPage(): CareersPageContent;
  getFaqPage(): FaqPageContent;
  getContactPage(): ContactPageContent;
  getPrivacyPolicyPage(): LegalPageContent;
  getTermsConditionsPage(): LegalPageContent;
  getCookiePolicyPage(): LegalPageContent;
  getAccessibilityStatementPage(): LegalPageContent;
  getCorporatePages(): CorporatePageContent[];
  getCorporatePage(slug: string): CorporatePageContent | null;
  getCorporatePageByPath(path: string): CorporatePageContent | null;
  getServicePages(): ServicePageContent[];
  getServicePage(category: string, slug: string): ServicePageContent | null;
  getServicePageByPath(path: string): ServicePageContent | null;
  getServiceCatalog(): ServiceCatalogItem[];
  getServicesHubPage(): ServicesPageContent;
  resolveRelatedServices(page: ServicePageContent): ServicePageContent[];
  getIndustryPages(): IndustryPageContent[];
  getIndustryPage(slug: string): IndustryPageContent | null;
  getIndustryPageByPath(path: string): IndustryPageContent | null;
  getIndustryCatalog(): IndustryCatalogItem[];
  getIndustriesHubPage(): IndustriesPageContent;
  resolveApplicableServices(page: IndustryPageContent): ServicePageContent[];
  getCoursePages(): CoursePageContent[];
  getCoursePage(category: string, slug: string): CoursePageContent | null;
  getCoursePageByPath(path: string): CoursePageContent | null;
  getTrainingCatalog(): TrainingCatalogItem[];
  getTrainingHubPage(): TrainingPageContent;
  resolveRelatedCourses(page: CoursePageContent): CoursePageContent[];
  resolveCourseServices(page: CoursePageContent): ServicePageContent[];
  getResourcePages(): ResourcePageContent[];
  getResourcePage(type: string, slug: string): ResourcePageContent | null;
  getResourcePageByPath(path: string): ResourcePageContent | null;
  getResourceCatalog(): ResourceCatalogItem[];
  getResourcesHubPage(): KnowledgePageContent;
  resolveRelatedResources(page: ResourcePageContent): ResourcePageContent[];
  resolveResourceServices(page: ResourcePageContent): ServicePageContent[];
  resolveResourceCourses(page: ResourcePageContent): CoursePageContent[];
  getCaseStudyPages(): CaseStudyPageContent[];
  getCaseStudyPage(
    industry: string,
    slug: string,
  ): CaseStudyPageContent | null;
  getCaseStudyPageByPath(path: string): CaseStudyPageContent | null;
  getCaseStudyCatalog(): CaseStudyCatalogItem[];
  getCaseStudiesHubPage(): CaseStudiesHubPageContent;
  resolveRelatedCaseStudies(page: CaseStudyPageContent): CaseStudyPageContent[];
  resolveCaseStudyServices(page: CaseStudyPageContent): ServicePageContent[];
  resolveCaseStudyCourses(page: CaseStudyPageContent): CoursePageContent[];
  resolveCaseStudyResources(page: CaseStudyPageContent): ResourcePageContent[];
  getTestimonialPages(): TestimonialPageContent[];
  getTestimonialPage(slug: string): TestimonialPageContent | null;
  getTestimonialPageByPath(path: string): TestimonialPageContent | null;
  getTestimonialCatalog(): TestimonialCatalogItem[];
  getTestimonialsHubPage(): TestimonialsHubPageContent;
  resolveTestimonials(slugs: string[]): TestimonialPageContent[];
  getClientSuccessPages(): ClientSuccessPageContent[];
  getClientSuccessPage(slug: string): ClientSuccessPageContent | null;
  getClientSuccessPageByPath(path: string): ClientSuccessPageContent | null;
  getClientSuccessCatalog(): ClientSuccessCatalogItem[];
  getClientSuccessHubPage(): ClientSuccessHubPageContent;
}

/** Future CMS integration — same surface, async resolution. */
export interface AsyncContentSource {
  getSiteConfig(): Promise<SiteConfig>;
  getHomePage(): Promise<HomePageContent>;
  getServicesPage(): Promise<ServicesPageContent>;
  getIndustriesPage(): Promise<IndustriesPageContent>;
  getTrainingPage(): Promise<TrainingPageContent>;
  getKnowledgePage(): Promise<KnowledgePageContent>;
  getCaseStudiesPage(): Promise<CaseStudiesPageContent>;
  getCareersPage(): Promise<CareersPageContent>;
  getFaqPage(): Promise<FaqPageContent>;
  getContactPage(): Promise<ContactPageContent>;
  getPrivacyPolicyPage(): Promise<LegalPageContent>;
  getTermsConditionsPage(): Promise<LegalPageContent>;
  getCookiePolicyPage(): Promise<LegalPageContent>;
  getAccessibilityStatementPage(): Promise<LegalPageContent>;
  getCorporatePages(): Promise<CorporatePageContent[]>;
  getCorporatePage(slug: string): Promise<CorporatePageContent | null>;
  getCorporatePageByPath(path: string): Promise<CorporatePageContent | null>;
  getServicePages(): Promise<ServicePageContent[]>;
  getServicePage(
    category: string,
    slug: string,
  ): Promise<ServicePageContent | null>;
  getServicePageByPath(path: string): Promise<ServicePageContent | null>;
  getServiceCatalog(): Promise<ServiceCatalogItem[]>;
  getServicesHubPage(): Promise<ServicesPageContent>;
  resolveRelatedServices(
    page: ServicePageContent,
  ): Promise<ServicePageContent[]>;
  getIndustryPages(): Promise<IndustryPageContent[]>;
  getIndustryPage(slug: string): Promise<IndustryPageContent | null>;
  getIndustryPageByPath(path: string): Promise<IndustryPageContent | null>;
  getIndustryCatalog(): Promise<IndustryCatalogItem[]>;
  getIndustriesHubPage(): Promise<IndustriesPageContent>;
  resolveApplicableServices(
    page: IndustryPageContent,
  ): Promise<ServicePageContent[]>;
  getCoursePages(): Promise<CoursePageContent[]>;
  getCoursePage(
    category: string,
    slug: string,
  ): Promise<CoursePageContent | null>;
  getCoursePageByPath(path: string): Promise<CoursePageContent | null>;
  getTrainingCatalog(): Promise<TrainingCatalogItem[]>;
  getTrainingHubPage(): Promise<TrainingPageContent>;
  resolveRelatedCourses(page: CoursePageContent): Promise<CoursePageContent[]>;
  resolveCourseServices(page: CoursePageContent): Promise<ServicePageContent[]>;
  getResourcePages(): Promise<ResourcePageContent[]>;
  getResourcePage(
    type: string,
    slug: string,
  ): Promise<ResourcePageContent | null>;
  getResourcePageByPath(path: string): Promise<ResourcePageContent | null>;
  getResourceCatalog(): Promise<ResourceCatalogItem[]>;
  getResourcesHubPage(): Promise<KnowledgePageContent>;
  resolveRelatedResources(
    page: ResourcePageContent,
  ): Promise<ResourcePageContent[]>;
  resolveResourceServices(
    page: ResourcePageContent,
  ): Promise<ServicePageContent[]>;
  resolveResourceCourses(
    page: ResourcePageContent,
  ): Promise<CoursePageContent[]>;
  getCaseStudyPages(): Promise<CaseStudyPageContent[]>;
  getCaseStudyPage(
    industry: string,
    slug: string,
  ): Promise<CaseStudyPageContent | null>;
  getCaseStudyPageByPath(path: string): Promise<CaseStudyPageContent | null>;
  getCaseStudyCatalog(): Promise<CaseStudyCatalogItem[]>;
  getCaseStudiesHubPage(): Promise<CaseStudiesHubPageContent>;
  resolveRelatedCaseStudies(
    page: CaseStudyPageContent,
  ): Promise<CaseStudyPageContent[]>;
  resolveCaseStudyServices(
    page: CaseStudyPageContent,
  ): Promise<ServicePageContent[]>;
  resolveCaseStudyCourses(
    page: CaseStudyPageContent,
  ): Promise<CoursePageContent[]>;
  resolveCaseStudyResources(
    page: CaseStudyPageContent,
  ): Promise<ResourcePageContent[]>;
  getTestimonialPages(): Promise<TestimonialPageContent[]>;
  getTestimonialPage(slug: string): Promise<TestimonialPageContent | null>;
  getTestimonialPageByPath(path: string): Promise<TestimonialPageContent | null>;
  getTestimonialCatalog(): Promise<TestimonialCatalogItem[]>;
  getTestimonialsHubPage(): Promise<TestimonialsHubPageContent>;
  resolveTestimonials(slugs: string[]): Promise<TestimonialPageContent[]>;
  getClientSuccessPages(): Promise<ClientSuccessPageContent[]>;
  getClientSuccessPage(slug: string): Promise<ClientSuccessPageContent | null>;
  getClientSuccessPageByPath(
    path: string,
  ): Promise<ClientSuccessPageContent | null>;
  getClientSuccessCatalog(): Promise<ClientSuccessCatalogItem[]>;
  getClientSuccessHubPage(): Promise<ClientSuccessHubPageContent>;
}

export class FileContentLoader implements ContentSource {
  private readonly cache = new Map<string, unknown>();

  private cached<T>(key: string, factory: () => T): T {
    const existing = this.cache.get(key);
    if (existing !== undefined) {
      return existing as T;
    }
    const value = factory();
    this.cache.set(key, value);
    return value;
  }

  getSiteConfig(): SiteConfig {
    return this.cached('site', () =>
      validateContent(siteConfigSchema, siteConfigData, 'site'),
    );
  }

  getHomePage(): HomePageContent {
    return this.cached('home', () =>
      validateContent(homePageSchema, homePageData, 'home'),
    );
  }

  getServicesPage(): ServicesPageContent {
    return this.cached('services', () =>
      validateContent(servicesHubPageSchema, servicesPageData, 'services'),
    );
  }

  getIndustriesPage(): IndustriesPageContent {
    return this.cached('industries', () =>
      validateContent(
        industriesHubPageSchema,
        industriesPageData,
        'industries',
      ),
    );
  }

  getTrainingPage(): TrainingPageContent {
    return this.cached('training', () =>
      validateContent(trainingHubPageSchema, trainingPageData, 'training'),
    );
  }

  getKnowledgePage(): KnowledgePageContent {
    return this.getResourcesHubPage();
  }

  getResourcesHubPage(): KnowledgePageContent {
    return this.cached('resources-hub', () =>
      validateContent(resourcesHubPageSchema, knowledgePageData, 'resources'),
    );
  }

  getCaseStudiesPage(): CaseStudiesHubPageContent {
    return this.getCaseStudiesHubPage();
  }

  getCaseStudiesHubPage(): CaseStudiesHubPageContent {
    return this.cached('case-studies-hub', () =>
      validateContent(
        caseStudiesHubPageSchema,
        caseStudiesHubPageData,
        'case-studies',
      ),
    );
  }

  getCaseStudyPages(): CaseStudyPageContent[] {
    return this.cached('case-study-pages', () =>
      caseStudyPageRegistry.map((page) =>
        validateContent(
          caseStudyPageSchema,
          page,
          `${page.industry}/${page.slug}`,
        ),
      ),
    );
  }

  getCaseStudyPage(
    industry: string,
    slug: string,
  ): CaseStudyPageContent | null {
    const pages = this.getCaseStudyPages();
    return (
      pages.find((p) => p.industry === industry && p.slug === slug) ?? null
    );
  }

  getCaseStudyPageByPath(path: string): CaseStudyPageContent | null {
    const pages = this.getCaseStudyPages();
    return pages.find((page) => page.path === path) ?? null;
  }

  getCaseStudyCatalog(): CaseStudyCatalogItem[] {
    return this.cached('case-study-catalog', () =>
      this.getCaseStudyPages().map(toCaseStudyCatalogItem),
    );
  }

  resolveRelatedCaseStudies(
    page: CaseStudyPageContent,
  ): CaseStudyPageContent[] {
    return resolveRelatedCaseStudies(
      this.getCaseStudyPages(),
      page.relatedCaseStudies ?? [],
    );
  }

  resolveCaseStudyServices(page: CaseStudyPageContent): ServicePageContent[] {
    return resolveCaseStudyServices(
      this.getServicePages(),
      page.relatedServices,
    );
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
      testimonialPageRegistry.map((page) =>
        validateContent(testimonialPageSchema, page, page.slug),
      ),
    );
  }

  getTestimonialPage(slug: string): TestimonialPageContent | null {
    const pages = this.getTestimonialPages();
    return pages.find((p) => p.slug === slug) ?? null;
  }

  getTestimonialPageByPath(path: string): TestimonialPageContent | null {
    const pages = this.getTestimonialPages();
    return pages.find((page) => page.path === path) ?? null;
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
        testimonialsHubPageData,
        'testimonials',
      ),
    );
  }

  resolveTestimonials(slugs: string[]): TestimonialPageContent[] {
    return resolveRelatedTestimonials(this.getTestimonialPages(), slugs);
  }

  getClientSuccessPages(): ClientSuccessPageContent[] {
    return this.cached('client-success-pages', () =>
      clientSuccessPageRegistry.map((page) =>
        validateContent(clientSuccessPageSchema, page, page.slug),
      ),
    );
  }

  getClientSuccessPage(slug: string): ClientSuccessPageContent | null {
    const pages = this.getClientSuccessPages();
    return pages.find((p) => p.slug === slug) ?? null;
  }

  getClientSuccessPageByPath(path: string): ClientSuccessPageContent | null {
    const pages = this.getClientSuccessPages();
    return pages.find((page) => page.path === path) ?? null;
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
        clientSuccessHubPageData,
        'client-success',
      ),
    );
  }

  resolveHubClientSuccessStories(
    slugs: ClientSuccessHubPageContent['featuredStories'],
  ): ClientSuccessPageContent[] {
    return resolveHubClientSuccessStories(this.getClientSuccessPages(), slugs);
  }

  getCareersPage(): CareersPageContent {
    return this.cached('careers', () =>
      validateContent(careersPageSchema, careersPageData, 'careers'),
    );
  }

  getFaqPage(): FaqPageContent {
    return this.cached('faq', () =>
      validateContent(faqPageSchema, faqPageData, 'faq'),
    );
  }

  getContactPage(): ContactPageContent {
    return this.cached('contact', () =>
      validateContent(contactPageSchema, contactPageData, 'contact'),
    );
  }

  getPrivacyPolicyPage(): LegalPageContent {
    return this.cached('privacy-policy', () =>
      validateContent(legalPageSchema, privacyPolicyData, 'privacy-policy'),
    );
  }

  getTermsConditionsPage(): LegalPageContent {
    return this.cached('terms-conditions', () =>
      validateContent(legalPageSchema, termsConditionsData, 'terms-conditions'),
    );
  }

  getCookiePolicyPage(): LegalPageContent {
    return this.cached('cookie-policy', () =>
      validateContent(legalPageSchema, cookiePolicyData, 'cookie-policy'),
    );
  }

  getAccessibilityStatementPage(): LegalPageContent {
    return this.cached('accessibility-statement', () =>
      validateContent(
        legalPageSchema,
        accessibilityStatementData,
        'accessibility-statement',
      ),
    );
  }

  getCorporatePages(): CorporatePageContent[] {
    return this.cached('corporate-pages', () =>
      corporatePageRegistry.map((page) =>
        validateContent(corporatePageSchema, page, page.slug),
      ),
    );
  }

  getCorporatePage(slug: string): CorporatePageContent | null {
    const pages = this.getCorporatePages();
    return pages.find((page) => page.slug === slug) ?? null;
  }

  getCorporatePageByPath(path: string): CorporatePageContent | null {
    const pages = this.getCorporatePages();
    return pages.find((page) => page.path === path) ?? null;
  }

  getServicePages(): ServicePageContent[] {
    return this.cached('service-pages', () =>
      servicePageRegistry.map((page) =>
        validateContent(
          servicePageSchema,
          page,
          `${page.category}/${page.slug}`,
        ),
      ),
    );
  }

  getServicePage(category: string, slug: string): ServicePageContent | null {
    const pages = this.getServicePages();
    return (
      pages.find((p) => p.category === category && p.slug === slug) ?? null
    );
  }

  getServicePageByPath(path: string): ServicePageContent | null {
    const pages = this.getServicePages();
    return pages.find((page) => page.path === path) ?? null;
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
      industryPageRegistry.map((page) =>
        validateContent(industryPageSchema, page, page.slug),
      ),
    );
  }

  getIndustryPage(slug: string): IndustryPageContent | null {
    const pages = this.getIndustryPages();
    return pages.find((p) => p.slug === slug) ?? null;
  }

  getIndustryPageByPath(path: string): IndustryPageContent | null {
    const pages = this.getIndustryPages();
    return pages.find((page) => page.path === path) ?? null;
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
      trainingPageRegistry.map((page) =>
        validateContent(
          coursePageSchema,
          page,
          `${page.category}/${page.slug}`,
        ),
      ),
    );
  }

  getCoursePage(category: string, slug: string): CoursePageContent | null {
    const pages = this.getCoursePages();
    return (
      pages.find((p) => p.category === category && p.slug === slug) ?? null
    );
  }

  getCoursePageByPath(path: string): CoursePageContent | null {
    const pages = this.getCoursePages();
    return pages.find((page) => page.path === path) ?? null;
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
    return resolveRelatedCourses(
      this.getCoursePages(),
      page.relatedCourses ?? [],
    );
  }

  resolveCourseServices(page: CoursePageContent): ServicePageContent[] {
    return resolveRelatedServicesForCourse(
      this.getServicePages(),
      page.relatedServices,
    );
  }

  getResourcePages(): ResourcePageContent[] {
    return this.cached('resource-pages', () =>
      resourcePageRegistry.map((page) =>
        validateContent(resourcePageSchema, page, `${page.type}/${page.slug}`),
      ),
    );
  }

  getResourcePage(type: string, slug: string): ResourcePageContent | null {
    const pages = this.getResourcePages();
    return pages.find((p) => p.type === type && p.slug === slug) ?? null;
  }

  getResourcePageByPath(path: string): ResourcePageContent | null {
    const pages = this.getResourcePages();
    return pages.find((page) => page.path === path) ?? null;
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
    return resolveResourceServices(
      this.getServicePages(),
      page.relatedServices,
    );
  }

  resolveResourceCourses(page: ResourcePageContent): CoursePageContent[] {
    return resolveResourceCourses(
      this.getCoursePages(),
      page.relatedCourses ?? [],
    );
  }
}

/** Singleton loader for the public website. Replace at CMS integration. */
class DelegatingContentLoader implements ContentSource {
  private delegate: ContentSource = new FileContentLoader();

  use(source: ContentSource) {
    this.delegate = source;
  }

  getSiteConfig() {
    return this.delegate.getSiteConfig();
  }
  getHomePage() {
    return this.delegate.getHomePage();
  }
  getServicesPage() {
    return this.delegate.getServicesPage();
  }
  getIndustriesPage() {
    return this.delegate.getIndustriesPage();
  }
  getTrainingPage() {
    return this.delegate.getTrainingPage();
  }
  getKnowledgePage() {
    return this.delegate.getKnowledgePage();
  }
  getCaseStudiesPage() {
    return this.delegate.getCaseStudiesPage();
  }
  getCareersPage() {
    return this.delegate.getCareersPage();
  }
  getFaqPage() {
    return this.delegate.getFaqPage();
  }
  getContactPage() {
    return this.delegate.getContactPage();
  }
  getPrivacyPolicyPage() {
    return this.delegate.getPrivacyPolicyPage();
  }
  getTermsConditionsPage() {
    return this.delegate.getTermsConditionsPage();
  }
  getCookiePolicyPage() {
    return this.delegate.getCookiePolicyPage();
  }
  getAccessibilityStatementPage() {
    return this.delegate.getAccessibilityStatementPage();
  }
  getCorporatePages() {
    return this.delegate.getCorporatePages();
  }
  getCorporatePage(slug: string) {
    return this.delegate.getCorporatePage(slug);
  }
  getCorporatePageByPath(path: string) {
    return this.delegate.getCorporatePageByPath(path);
  }
  getServicePages() {
    return this.delegate.getServicePages();
  }
  getServicePage(category: string, slug: string) {
    return this.delegate.getServicePage(category, slug);
  }
  getServicePageByPath(path: string) {
    return this.delegate.getServicePageByPath(path);
  }
  getServiceCatalog() {
    return this.delegate.getServiceCatalog();
  }
  getServicesHubPage() {
    return this.delegate.getServicesHubPage();
  }
  resolveRelatedServices(page: ServicePageContent) {
    return this.delegate.resolveRelatedServices(page);
  }
  getIndustryPages() {
    return this.delegate.getIndustryPages();
  }
  getIndustryPage(slug: string) {
    return this.delegate.getIndustryPage(slug);
  }
  getIndustryPageByPath(path: string) {
    return this.delegate.getIndustryPageByPath(path);
  }
  getIndustryCatalog() {
    return this.delegate.getIndustryCatalog();
  }
  getIndustriesHubPage() {
    return this.delegate.getIndustriesHubPage();
  }
  resolveApplicableServices(page: IndustryPageContent) {
    return this.delegate.resolveApplicableServices(page);
  }
  getCoursePages() {
    return this.delegate.getCoursePages();
  }
  getCoursePage(category: string, slug: string) {
    return this.delegate.getCoursePage(category, slug);
  }
  getCoursePageByPath(path: string) {
    return this.delegate.getCoursePageByPath(path);
  }
  getTrainingCatalog() {
    return this.delegate.getTrainingCatalog();
  }
  getTrainingHubPage() {
    return this.delegate.getTrainingHubPage();
  }
  resolveRelatedCourses(page: CoursePageContent) {
    return this.delegate.resolveRelatedCourses(page);
  }
  resolveCourseServices(page: CoursePageContent) {
    return this.delegate.resolveCourseServices(page);
  }
  getResourcePages() {
    return this.delegate.getResourcePages();
  }
  getResourcePage(type: string, slug: string) {
    return this.delegate.getResourcePage(type, slug);
  }
  getResourcePageByPath(path: string) {
    return this.delegate.getResourcePageByPath(path);
  }
  getResourceCatalog() {
    return this.delegate.getResourceCatalog();
  }
  getResourcesHubPage() {
    return this.delegate.getResourcesHubPage();
  }
  resolveRelatedResources(page: ResourcePageContent) {
    return this.delegate.resolveRelatedResources(page);
  }
  resolveResourceServices(page: ResourcePageContent) {
    return this.delegate.resolveResourceServices(page);
  }
  resolveResourceCourses(page: ResourcePageContent) {
    return this.delegate.resolveResourceCourses(page);
  }
  getCaseStudyPages() {
    return this.delegate.getCaseStudyPages();
  }
  getCaseStudyPage(industry: string, slug: string) {
    return this.delegate.getCaseStudyPage(industry, slug);
  }
  getCaseStudyPageByPath(path: string) {
    return this.delegate.getCaseStudyPageByPath(path);
  }
  getCaseStudyCatalog() {
    return this.delegate.getCaseStudyCatalog();
  }
  getCaseStudiesHubPage() {
    return this.delegate.getCaseStudiesHubPage();
  }
  resolveRelatedCaseStudies(page: CaseStudyPageContent) {
    return this.delegate.resolveRelatedCaseStudies(page);
  }
  resolveCaseStudyServices(page: CaseStudyPageContent) {
    return this.delegate.resolveCaseStudyServices(page);
  }
  resolveCaseStudyCourses(page: CaseStudyPageContent) {
    return this.delegate.resolveCaseStudyCourses(page);
  }
  resolveCaseStudyResources(page: CaseStudyPageContent) {
    return this.delegate.resolveCaseStudyResources(page);
  }
  getTestimonialPages() {
    return this.delegate.getTestimonialPages();
  }
  getTestimonialPage(slug: string) {
    return this.delegate.getTestimonialPage(slug);
  }
  getTestimonialPageByPath(path: string) {
    return this.delegate.getTestimonialPageByPath(path);
  }
  getTestimonialCatalog() {
    return this.delegate.getTestimonialCatalog();
  }
  getTestimonialsHubPage() {
    return this.delegate.getTestimonialsHubPage();
  }
  resolveTestimonials(slugs: string[]) {
    return this.delegate.resolveTestimonials(slugs);
  }
  getClientSuccessPages() {
    return this.delegate.getClientSuccessPages();
  }
  getClientSuccessPage(slug: string) {
    return this.delegate.getClientSuccessPage(slug);
  }
  getClientSuccessPageByPath(path: string) {
    return this.delegate.getClientSuccessPageByPath(path);
  }
  getClientSuccessCatalog() {
    return this.delegate.getClientSuccessCatalog();
  }
  getClientSuccessHubPage() {
    return this.delegate.getClientSuccessHubPage();
  }
}

const delegatingLoader = new DelegatingContentLoader();

export const contentLoader = delegatingLoader;

export function configureContentLoader(source: ContentSource) {
  delegatingLoader.use(source);
}

export { DatabaseContentLoader } from './database-content-loader.js';
export { CompositeContentLoader } from './composite-content-loader.js';

/** Wraps a sync loader for async consumers (SSR, CMS preview, etc.). */
export function toAsyncContentSource(
  source: ContentSource,
): AsyncContentSource {
  return {
    getSiteConfig: () => Promise.resolve(source.getSiteConfig()),
    getHomePage: () => Promise.resolve(source.getHomePage()),
    getServicesPage: () => Promise.resolve(source.getServicesPage()),
    getIndustriesPage: () => Promise.resolve(source.getIndustriesPage()),
    getTrainingPage: () => Promise.resolve(source.getTrainingPage()),
    getKnowledgePage: () => Promise.resolve(source.getKnowledgePage()),
    getCaseStudiesPage: () => Promise.resolve(source.getCaseStudiesPage()),
    getCareersPage: () => Promise.resolve(source.getCareersPage()),
    getFaqPage: () => Promise.resolve(source.getFaqPage()),
    getContactPage: () => Promise.resolve(source.getContactPage()),
    getPrivacyPolicyPage: () => Promise.resolve(source.getPrivacyPolicyPage()),
    getTermsConditionsPage: () =>
      Promise.resolve(source.getTermsConditionsPage()),
    getCookiePolicyPage: () => Promise.resolve(source.getCookiePolicyPage()),
    getAccessibilityStatementPage: () =>
      Promise.resolve(source.getAccessibilityStatementPage()),
    getCorporatePages: () => Promise.resolve(source.getCorporatePages()),
    getCorporatePage: (slug) => Promise.resolve(source.getCorporatePage(slug)),
    getCorporatePageByPath: (path) =>
      Promise.resolve(source.getCorporatePageByPath(path)),
    getServicePages: () => Promise.resolve(source.getServicePages()),
    getServicePage: (category, slug) =>
      Promise.resolve(source.getServicePage(category, slug)),
    getServicePageByPath: (path) =>
      Promise.resolve(source.getServicePageByPath(path)),
    getServiceCatalog: () => Promise.resolve(source.getServiceCatalog()),
    getServicesHubPage: () => Promise.resolve(source.getServicesHubPage()),
    resolveRelatedServices: (page) =>
      Promise.resolve(source.resolveRelatedServices(page)),
    getIndustryPages: () => Promise.resolve(source.getIndustryPages()),
    getIndustryPage: (slug) => Promise.resolve(source.getIndustryPage(slug)),
    getIndustryPageByPath: (path) =>
      Promise.resolve(source.getIndustryPageByPath(path)),
    getIndustryCatalog: () => Promise.resolve(source.getIndustryCatalog()),
    getIndustriesHubPage: () => Promise.resolve(source.getIndustriesHubPage()),
    resolveApplicableServices: (page) =>
      Promise.resolve(source.resolveApplicableServices(page)),
    getCoursePages: () => Promise.resolve(source.getCoursePages()),
    getCoursePage: (category, slug) =>
      Promise.resolve(source.getCoursePage(category, slug)),
    getCoursePageByPath: (path) =>
      Promise.resolve(source.getCoursePageByPath(path)),
    getTrainingCatalog: () => Promise.resolve(source.getTrainingCatalog()),
    getTrainingHubPage: () => Promise.resolve(source.getTrainingHubPage()),
    resolveRelatedCourses: (page) =>
      Promise.resolve(source.resolveRelatedCourses(page)),
    resolveCourseServices: (page) =>
      Promise.resolve(source.resolveCourseServices(page)),
    getResourcePages: () => Promise.resolve(source.getResourcePages()),
    getResourcePage: (type, slug) =>
      Promise.resolve(source.getResourcePage(type, slug)),
    getResourcePageByPath: (path) =>
      Promise.resolve(source.getResourcePageByPath(path)),
    getResourceCatalog: () => Promise.resolve(source.getResourceCatalog()),
    getResourcesHubPage: () => Promise.resolve(source.getResourcesHubPage()),
    resolveRelatedResources: (page) =>
      Promise.resolve(source.resolveRelatedResources(page)),
    resolveResourceServices: (page) =>
      Promise.resolve(source.resolveResourceServices(page)),
    resolveResourceCourses: (page) =>
      Promise.resolve(source.resolveResourceCourses(page)),
    getCaseStudyPages: () => Promise.resolve(source.getCaseStudyPages()),
    getCaseStudyPage: (industry, slug) =>
      Promise.resolve(source.getCaseStudyPage(industry, slug)),
    getCaseStudyPageByPath: (path) =>
      Promise.resolve(source.getCaseStudyPageByPath(path)),
    getCaseStudyCatalog: () => Promise.resolve(source.getCaseStudyCatalog()),
    getCaseStudiesHubPage: () =>
      Promise.resolve(source.getCaseStudiesHubPage()),
    resolveRelatedCaseStudies: (page) =>
      Promise.resolve(source.resolveRelatedCaseStudies(page)),
    resolveCaseStudyServices: (page) =>
      Promise.resolve(source.resolveCaseStudyServices(page)),
    resolveCaseStudyCourses: (page) =>
      Promise.resolve(source.resolveCaseStudyCourses(page)),
    resolveCaseStudyResources: (page) =>
      Promise.resolve(source.resolveCaseStudyResources(page)),
    getTestimonialPages: () => Promise.resolve(source.getTestimonialPages()),
    getTestimonialPage: (slug) =>
      Promise.resolve(source.getTestimonialPage(slug)),
    getTestimonialPageByPath: (path) =>
      Promise.resolve(source.getTestimonialPageByPath(path)),
    getTestimonialCatalog: () =>
      Promise.resolve(source.getTestimonialCatalog()),
    getTestimonialsHubPage: () =>
      Promise.resolve(source.getTestimonialsHubPage()),
    resolveTestimonials: (slugs) =>
      Promise.resolve(source.resolveTestimonials(slugs)),
    getClientSuccessPages: () =>
      Promise.resolve(source.getClientSuccessPages()),
    getClientSuccessPage: (slug) =>
      Promise.resolve(source.getClientSuccessPage(slug)),
    getClientSuccessPageByPath: (path) =>
      Promise.resolve(source.getClientSuccessPageByPath(path)),
    getClientSuccessCatalog: () =>
      Promise.resolve(source.getClientSuccessCatalog()),
    getClientSuccessHubPage: () =>
      Promise.resolve(source.getClientSuccessHubPage()),
  };
}
