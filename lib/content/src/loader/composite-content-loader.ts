import type { ContentSource } from './index.js';

function isNullableEmpty<T>(value: T | null): value is null {
  return value === null;
}

function isEmptyArray<T>(value: T[]): boolean {
  return value.length === 0;
}

/** Prefer CMS snapshot values; fall back to file-backed content when missing. */
export class CompositeContentLoader implements ContentSource {
  constructor(
    private readonly primary: ContentSource,
    private readonly fallback: ContentSource,
  ) {}

  private pick<T>(primary: () => T, fallback: () => T): T {
    try {
      return primary();
    } catch {
      return fallback();
    }
  }

  private pickNullable<T>(
    primary: () => T | null,
    fallback: () => T | null,
  ): T | null {
    try {
      const value = primary();
      if (isNullableEmpty(value)) {
        return fallback();
      }
      return value;
    } catch {
      return fallback();
    }
  }

  private pickList<T>(primary: () => T[], fallback: () => T[]): T[] {
    try {
      const value = primary();
      if (isEmptyArray(value)) {
        return fallback();
      }
      return value;
    } catch {
      return fallback();
    }
  }

  getSiteConfig() {
    return this.pick(
      () => this.primary.getSiteConfig(),
      () => this.fallback.getSiteConfig(),
    );
  }

  getHomePage() {
    return this.pick(
      () => this.primary.getHomePage(),
      () => this.fallback.getHomePage(),
    );
  }

  getServicesPage() {
    return this.pick(
      () => this.primary.getServicesPage(),
      () => this.fallback.getServicesPage(),
    );
  }

  getIndustriesPage() {
    return this.pick(
      () => this.primary.getIndustriesPage(),
      () => this.fallback.getIndustriesPage(),
    );
  }

  getTrainingPage() {
    return this.pick(
      () => this.primary.getTrainingPage(),
      () => this.fallback.getTrainingPage(),
    );
  }

  getKnowledgePage() {
    return this.pick(
      () => this.primary.getKnowledgePage(),
      () => this.fallback.getKnowledgePage(),
    );
  }

  getCaseStudiesPage() {
    return this.pick(
      () => this.primary.getCaseStudiesPage(),
      () => this.fallback.getCaseStudiesPage(),
    );
  }

  getCareersPage() {
    return this.pick(
      () => this.primary.getCareersPage(),
      () => this.fallback.getCareersPage(),
    );
  }

  getContactPage() {
    return this.pick(
      () => this.primary.getContactPage(),
      () => this.fallback.getContactPage(),
    );
  }

  getPrivacyPolicyPage() {
    return this.pick(
      () => this.primary.getPrivacyPolicyPage(),
      () => this.fallback.getPrivacyPolicyPage(),
    );
  }

  getTermsConditionsPage() {
    return this.pick(
      () => this.primary.getTermsConditionsPage(),
      () => this.fallback.getTermsConditionsPage(),
    );
  }

  getCookiePolicyPage() {
    return this.pick(
      () => this.primary.getCookiePolicyPage(),
      () => this.fallback.getCookiePolicyPage(),
    );
  }

  getAccessibilityStatementPage() {
    return this.pick(
      () => this.primary.getAccessibilityStatementPage(),
      () => this.fallback.getAccessibilityStatementPage(),
    );
  }

  getCorporatePages() {
    return this.pickList(
      () => this.primary.getCorporatePages(),
      () => this.fallback.getCorporatePages(),
    );
  }

  getCorporatePage(slug: string) {
    return this.pickNullable(
      () => this.primary.getCorporatePage(slug),
      () => this.fallback.getCorporatePage(slug),
    );
  }

  getCorporatePageByPath(path: string) {
    return this.pickNullable(
      () => this.primary.getCorporatePageByPath(path),
      () => this.fallback.getCorporatePageByPath(path),
    );
  }

  getServicePages() {
    return this.pickList(
      () => this.primary.getServicePages(),
      () => this.fallback.getServicePages(),
    );
  }

  getServicePage(category: string, slug: string) {
    return this.pickNullable(
      () => this.primary.getServicePage(category, slug),
      () => this.fallback.getServicePage(category, slug),
    );
  }

  getServicePageByPath(path: string) {
    return this.pickNullable(
      () => this.primary.getServicePageByPath(path),
      () => this.fallback.getServicePageByPath(path),
    );
  }

  getServiceCatalog() {
    return this.pickList(
      () => this.primary.getServiceCatalog(),
      () => this.fallback.getServiceCatalog(),
    );
  }

  getServicesHubPage() {
    return this.pick(
      () => this.primary.getServicesHubPage(),
      () => this.fallback.getServicesHubPage(),
    );
  }

  resolveRelatedServices(page: Parameters<ContentSource['resolveRelatedServices']>[0]) {
    const primary = this.primary.resolveRelatedServices(page);
    return primary.length > 0
      ? primary
      : this.fallback.resolveRelatedServices(page);
  }

  getIndustryPages() {
    return this.pickList(
      () => this.primary.getIndustryPages(),
      () => this.fallback.getIndustryPages(),
    );
  }

  getIndustryPage(slug: string) {
    return this.pickNullable(
      () => this.primary.getIndustryPage(slug),
      () => this.fallback.getIndustryPage(slug),
    );
  }

  getIndustryPageByPath(path: string) {
    return this.pickNullable(
      () => this.primary.getIndustryPageByPath(path),
      () => this.fallback.getIndustryPageByPath(path),
    );
  }

  getIndustryCatalog() {
    return this.pickList(
      () => this.primary.getIndustryCatalog(),
      () => this.fallback.getIndustryCatalog(),
    );
  }

  getIndustriesHubPage() {
    return this.pick(
      () => this.primary.getIndustriesHubPage(),
      () => this.fallback.getIndustriesHubPage(),
    );
  }

  resolveApplicableServices(page: Parameters<ContentSource['resolveApplicableServices']>[0]) {
    const primary = this.primary.resolveApplicableServices(page);
    return primary.length > 0
      ? primary
      : this.fallback.resolveApplicableServices(page);
  }

  getCoursePages() {
    return this.pickList(
      () => this.primary.getCoursePages(),
      () => this.fallback.getCoursePages(),
    );
  }

  getCoursePage(category: string, slug: string) {
    return this.pickNullable(
      () => this.primary.getCoursePage(category, slug),
      () => this.fallback.getCoursePage(category, slug),
    );
  }

  getCoursePageByPath(path: string) {
    return this.pickNullable(
      () => this.primary.getCoursePageByPath(path),
      () => this.fallback.getCoursePageByPath(path),
    );
  }

  getTrainingCatalog() {
    return this.pickList(
      () => this.primary.getTrainingCatalog(),
      () => this.fallback.getTrainingCatalog(),
    );
  }

  getTrainingHubPage() {
    return this.pick(
      () => this.primary.getTrainingHubPage(),
      () => this.fallback.getTrainingHubPage(),
    );
  }

  resolveRelatedCourses(page: Parameters<ContentSource['resolveRelatedCourses']>[0]) {
    const primary = this.primary.resolveRelatedCourses(page);
    return primary.length > 0
      ? primary
      : this.fallback.resolveRelatedCourses(page);
  }

  resolveCourseServices(page: Parameters<ContentSource['resolveCourseServices']>[0]) {
    const primary = this.primary.resolveCourseServices(page);
    return primary.length > 0
      ? primary
      : this.fallback.resolveCourseServices(page);
  }

  getResourcePages() {
    return this.pickList(
      () => this.primary.getResourcePages(),
      () => this.fallback.getResourcePages(),
    );
  }

  getResourcePage(type: string, slug: string) {
    return this.pickNullable(
      () => this.primary.getResourcePage(type, slug),
      () => this.fallback.getResourcePage(type, slug),
    );
  }

  getResourcePageByPath(path: string) {
    return this.pickNullable(
      () => this.primary.getResourcePageByPath(path),
      () => this.fallback.getResourcePageByPath(path),
    );
  }

  getResourceCatalog() {
    return this.pickList(
      () => this.primary.getResourceCatalog(),
      () => this.fallback.getResourceCatalog(),
    );
  }

  getResourcesHubPage() {
    return this.pick(
      () => this.primary.getResourcesHubPage(),
      () => this.fallback.getResourcesHubPage(),
    );
  }

  resolveRelatedResources(page: Parameters<ContentSource['resolveRelatedResources']>[0]) {
    const primary = this.primary.resolveRelatedResources(page);
    return primary.length > 0
      ? primary
      : this.fallback.resolveRelatedResources(page);
  }

  resolveResourceServices(page: Parameters<ContentSource['resolveResourceServices']>[0]) {
    const primary = this.primary.resolveResourceServices(page);
    return primary.length > 0
      ? primary
      : this.fallback.resolveResourceServices(page);
  }

  resolveResourceCourses(page: Parameters<ContentSource['resolveResourceCourses']>[0]) {
    const primary = this.primary.resolveResourceCourses(page);
    return primary.length > 0
      ? primary
      : this.fallback.resolveResourceCourses(page);
  }

  getCaseStudyPages() {
    return this.pickList(
      () => this.primary.getCaseStudyPages(),
      () => this.fallback.getCaseStudyPages(),
    );
  }

  getCaseStudyPage(industry: string, slug: string) {
    return this.pickNullable(
      () => this.primary.getCaseStudyPage(industry, slug),
      () => this.fallback.getCaseStudyPage(industry, slug),
    );
  }

  getCaseStudyPageByPath(path: string) {
    return this.pickNullable(
      () => this.primary.getCaseStudyPageByPath(path),
      () => this.fallback.getCaseStudyPageByPath(path),
    );
  }

  getCaseStudyCatalog() {
    return this.pickList(
      () => this.primary.getCaseStudyCatalog(),
      () => this.fallback.getCaseStudyCatalog(),
    );
  }

  getCaseStudiesHubPage() {
    return this.pick(
      () => this.primary.getCaseStudiesHubPage(),
      () => this.fallback.getCaseStudiesHubPage(),
    );
  }

  resolveRelatedCaseStudies(page: Parameters<ContentSource['resolveRelatedCaseStudies']>[0]) {
    const primary = this.primary.resolveRelatedCaseStudies(page);
    return primary.length > 0
      ? primary
      : this.fallback.resolveRelatedCaseStudies(page);
  }

  resolveCaseStudyServices(page: Parameters<ContentSource['resolveCaseStudyServices']>[0]) {
    const primary = this.primary.resolveCaseStudyServices(page);
    return primary.length > 0
      ? primary
      : this.fallback.resolveCaseStudyServices(page);
  }

  resolveCaseStudyCourses(page: Parameters<ContentSource['resolveCaseStudyCourses']>[0]) {
    const primary = this.primary.resolveCaseStudyCourses(page);
    return primary.length > 0
      ? primary
      : this.fallback.resolveCaseStudyCourses(page);
  }

  resolveCaseStudyResources(page: Parameters<ContentSource['resolveCaseStudyResources']>[0]) {
    const primary = this.primary.resolveCaseStudyResources(page);
    return primary.length > 0
      ? primary
      : this.fallback.resolveCaseStudyResources(page);
  }

  getTestimonialPages() {
    return this.pickList(
      () => this.primary.getTestimonialPages(),
      () => this.fallback.getTestimonialPages(),
    );
  }

  getTestimonialPage(slug: string) {
    return this.pickNullable(
      () => this.primary.getTestimonialPage(slug),
      () => this.fallback.getTestimonialPage(slug),
    );
  }

  getTestimonialPageByPath(path: string) {
    return this.pickNullable(
      () => this.primary.getTestimonialPageByPath(path),
      () => this.fallback.getTestimonialPageByPath(path),
    );
  }

  getTestimonialCatalog() {
    return this.pickList(
      () => this.primary.getTestimonialCatalog(),
      () => this.fallback.getTestimonialCatalog(),
    );
  }

  getTestimonialsHubPage() {
    return this.pick(
      () => this.primary.getTestimonialsHubPage(),
      () => this.fallback.getTestimonialsHubPage(),
    );
  }

  resolveTestimonials(slugs: string[]) {
    const primary = this.primary.resolveTestimonials(slugs);
    return primary.length > 0
      ? primary
      : this.fallback.resolveTestimonials(slugs);
  }

  getClientSuccessPages() {
    return this.pickList(
      () => this.primary.getClientSuccessPages(),
      () => this.fallback.getClientSuccessPages(),
    );
  }

  getClientSuccessPage(slug: string) {
    return this.pickNullable(
      () => this.primary.getClientSuccessPage(slug),
      () => this.fallback.getClientSuccessPage(slug),
    );
  }

  getClientSuccessPageByPath(path: string) {
    return this.pickNullable(
      () => this.primary.getClientSuccessPageByPath(path),
      () => this.fallback.getClientSuccessPageByPath(path),
    );
  }

  getClientSuccessCatalog() {
    return this.pickList(
      () => this.primary.getClientSuccessCatalog(),
      () => this.fallback.getClientSuccessCatalog(),
    );
  }

  getClientSuccessHubPage() {
    return this.pick(
      () => this.primary.getClientSuccessHubPage(),
      () => this.fallback.getClientSuccessHubPage(),
    );
  }
}
