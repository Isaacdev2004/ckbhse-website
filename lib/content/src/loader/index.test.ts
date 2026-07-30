import { describe, expect, it } from 'vitest';
import { contentLoader } from './index.js';

describe('FileContentLoader', () => {
  it('loads and validates site configuration', () => {
    const site = contentLoader.getSiteConfig();
    expect(site.navigation).toHaveLength(6);
    expect(site.cta.label).toBe('Book Consultation');
  });

  it('loads services with expected item count', () => {
    const services = contentLoader.getServicePages();
    expect(services).toHaveLength(38);
    expect(contentLoader.getServiceCatalog()).toHaveLength(38);
  });

  it('resolves service pages by category and slug', () => {
    const page = contentLoader.getServicePage(
      'health-safety',
      'health-safety-audits',
    );
    expect(page?.title).toBe('Health & Safety Audits');
    expect(page?.path).toBe('/services/health-safety/health-safety-audits');
  });

  it('resolves related services from metadata', () => {
    const page = contentLoader.getServicePage(
      'health-safety',
      'health-safety-audits',
    );
    expect(page).not.toBeNull();
    const related = contentLoader.resolveRelatedServices(page!);
    expect(related.length).toBeGreaterThan(0);
  });

  it('caches repeated reads', () => {
    const first = contentLoader.getHomePage();
    const second = contentLoader.getHomePage();
    expect(first).toBe(second);
  });

  it('loads all twelve corporate pages', () => {
    const pages = contentLoader.getCorporatePages();
    expect(pages).toHaveLength(12);
    expect(pages.map((p) => p.path)).toContain('/about');
    expect(pages.map((p) => p.path)).toContain('/about/mission');
  });

  it('resolves corporate pages by path', () => {
    const page = contentLoader.getCorporatePageByPath('/about/leadership');
    expect(page?.slug).toBe('leadership');
    expect(page?.sections.some((s) => s.type === 'leadership')).toBe(true);
  });

  it('loads all twelve industry pages', () => {
    const pages = contentLoader.getIndustryPages();
    expect(pages).toHaveLength(12);
    expect(contentLoader.getIndustryCatalog()).toHaveLength(12);
  });

  it('resolves industry pages by slug and path', () => {
    const page = contentLoader.getIndustryPage('construction');
    expect(page?.name).toBe('Construction');
    expect(page?.path).toBe('/industries/construction');
    expect(
      contentLoader.getIndustryPageByPath('/industries/construction'),
    ).toEqual(page);
  });

  it('resolves applicable services from industry metadata', () => {
    const page = contentLoader.getIndustryPage('construction');
    expect(page).not.toBeNull();
    const services = contentLoader.resolveApplicableServices(page!);
    expect(services.length).toBeGreaterThan(0);
    expect(services.every((s) => s.path.startsWith('/services/'))).toBe(true);
  });

  it('loads industries hub page', () => {
    const hub = contentLoader.getIndustriesHubPage();
    expect(hub.hero.title).toBeTruthy();
    expect(hub.featuredIndustries.length).toBeGreaterThan(0);
  });

  it('loads all twenty-nine course pages', () => {
    const courses = contentLoader.getCoursePages();
    expect(courses).toHaveLength(29);
    expect(contentLoader.getTrainingCatalog()).toHaveLength(29);
  });

  it('resolves course pages by category and slug', () => {
    const page = contentLoader.getCoursePage(
      'health-safety',
      'iosh-managing-safely',
    );
    expect(page?.title).toBe('IOSH Managing Safely');
    expect(page?.path).toBe('/training/health-safety/iosh-managing-safely');
  });

  it('resolves related courses and services from metadata', () => {
    const page = contentLoader.getCoursePage(
      'health-safety',
      'iosh-managing-safely',
    );
    expect(page).not.toBeNull();
    const related = contentLoader.resolveRelatedCourses(page!);
    expect(related.length).toBeGreaterThan(0);
    const services = contentLoader.resolveCourseServices(page!);
    expect(services.length).toBeGreaterThan(0);
  });

  it('loads training hub page', () => {
    const hub = contentLoader.getTrainingHubPage();
    expect(hub.hero.title).toBeTruthy();
    expect(hub.featuredCourses.length).toBeGreaterThan(0);
    expect(hub.learningPathways.pathways).toHaveLength(4);
  });

  it('loads all thirty-three resource pages', () => {
    const resources = contentLoader.getResourcePages();
    expect(resources).toHaveLength(33);
    expect(contentLoader.getResourceCatalog()).toHaveLength(33);
  });

  it('resolves resource pages by type and slug', () => {
    const page = contentLoader.getResourcePage(
      'articles',
      'understanding-cdm-2015',
    );
    expect(page?.title).toBeTruthy();
    expect(page?.path).toBe('/resources/articles/understanding-cdm-2015');
  });

  it('resolves related resources, services, and courses from metadata', () => {
    const page = contentLoader.getResourcePage(
      'articles',
      'understanding-cdm-2015',
    );
    expect(page).not.toBeNull();
    const related = contentLoader.resolveRelatedResources(page!);
    expect(related.length).toBeGreaterThan(0);
    const services = contentLoader.resolveResourceServices(page!);
    expect(services.length).toBeGreaterThan(0);
    const courses = contentLoader.resolveResourceCourses(page!);
    expect(courses.length).toBeGreaterThanOrEqual(0);
  });

  it('loads resources hub page via getKnowledgePage alias', () => {
    const hub = contentLoader.getResourcesHubPage();
    expect(hub.hero.title).toBeTruthy();
    expect(hub.featuredResources.length).toBeGreaterThan(0);
    expect(contentLoader.getKnowledgePage()).toEqual(hub);
  });

  it('loads all eight case study pages', () => {
    const studies = contentLoader.getCaseStudyPages();
    expect(studies).toHaveLength(8);
    expect(contentLoader.getCaseStudyCatalog()).toHaveLength(8);
  });

  it('resolves case study pages by industry and slug', () => {
    const page = contentLoader.getCaseStudyPage(
      'construction',
      'cdm-london-development',
    );
    expect(page?.title).toBeTruthy();
    expect(page?.path).toBe(
      '/case-studies/construction/cdm-london-development',
    );
  });

  it('loads all eight testimonial pages', () => {
    expect(contentLoader.getTestimonialPages()).toHaveLength(8);
  });

  it('loads all four client success stories', () => {
    expect(contentLoader.getClientSuccessPages()).toHaveLength(4);
  });
});
