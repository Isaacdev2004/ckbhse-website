import type { BreadcrumbItem } from '@workspace/content/schemas';
import { buildCanonicalUrl } from '../canonical.js';
import { getSeoSiteConfig } from '../config.js';

export interface OrganizationSchemaInput {
  name: string;
  url: string;
  logo?: string;
  email?: string;
  telephone?: string;
  addressLocality?: string;
  addressCountry?: string;
}

export function buildOrganizationSchema(input: OrganizationSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: input.name,
    url: input.url,
    ...(input.logo ? { logo: input.logo } : {}),
    ...(input.email ? { email: input.email } : {}),
    ...(input.telephone ? { telephone: input.telephone } : {}),
    ...(input.addressLocality || input.addressCountry
      ? {
          address: {
            '@type': 'PostalAddress',
            ...(input.addressLocality
              ? { addressLocality: input.addressLocality }
              : {}),
            ...(input.addressCountry
              ? { addressCountry: input.addressCountry }
              : {}),
          },
        }
      : {}),
  };
}

export function buildWebSiteSchema(input: {
  name: string;
  url: string;
  description?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: input.name,
    url: input.url,
    ...(input.description ? { description: input.description } : {}),
    publisher: {
      '@type': 'Organization',
      name: input.name,
      url: input.url,
    },
  };
}

export function buildBreadcrumbListSchema(
  items: BreadcrumbItem[],
  siteUrl?: string,
) {
  const config = getSeoSiteConfig();
  const base = siteUrl ?? config.siteUrl;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const position = index + 1;
      const entry: Record<string, unknown> = {
        '@type': 'ListItem',
        position,
        name: item.label,
      };
      if (item.href) {
        entry.item = buildCanonicalUrl(item.href, { siteUrl: base });
      }
      return entry;
    }),
  };
}

/** Industry/sector landing page schema. */
export function buildIndustryPageSchema(input: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: input.name,
    description: input.description,
    url: input.url,
    about: {
      '@type': 'Thing',
      name: input.name,
    },
  };
}

/** Future-ready Service schema builder (P4). */
export function buildServiceSchema(input: {
  name: string;
  description: string;
  url: string;
  providerName: string;
  providerUrl: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: input.url,
    provider: {
      '@type': 'Organization',
      name: input.providerName,
      url: input.providerUrl,
    },
  };
}

/** Future-ready Course schema builder (P5). */
export function buildCourseSchema(input: {
  name: string;
  description: string;
  url: string;
  providerName: string;
  providerUrl: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: input.name,
    description: input.description,
    url: input.url,
    provider: {
      '@type': 'Organization',
      name: input.providerName,
      url: input.providerUrl,
    },
  };
}

/** Article schema for guides and publications. */
export function buildArticleSchema(input: {
  headline: string;
  description: string;
  url: string;
  authorName: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    url: input.url,
    author: {
      '@type': 'Person',
      name: input.authorName,
    },
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
  };
}

/** NewsArticle schema for news and regulatory updates. */
export function buildNewsArticleSchema(input: {
  headline: string;
  description: string;
  url: string;
  authorName: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: input.headline,
    description: input.description,
    url: input.url,
    author: {
      '@type': 'Person',
      name: input.authorName,
    },
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
  };
}

/** Event schema for webinars. */
export function buildEventSchema(input: {
  name: string;
  description: string;
  url: string;
  startDate?: string;
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed';
  eventAttendanceMode?:
    'OnlineEventAttendanceMode' | 'OfflineEventAttendanceMode';
  organizerName: string;
  organizerUrl: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: input.name,
    description: input.description,
    url: input.url,
    ...(input.startDate ? { startDate: input.startDate } : {}),
    eventStatus: `https://schema.org/${input.eventStatus ?? 'EventScheduled'}`,
    eventAttendanceMode: `https://schema.org/${input.eventAttendanceMode ?? 'OnlineEventAttendanceMode'}`,
    organizer: {
      '@type': 'Organization',
      name: input.organizerName,
      url: input.organizerUrl,
    },
  };
}

/** Case study Article schema. */
export function buildCaseStudySchema(input: {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    url: input.url,
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
  };
}

/** CreativeWork schema for case studies. */
export function buildCreativeWorkSchema(input: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: input.name,
    description: input.description,
    url: input.url,
  };
}

/** Review schema for testimonials. */
export function buildReviewSchema(input: {
  author: string;
  reviewBody: string;
  ratingValue: number;
  itemReviewed: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: { '@type': 'Person', name: input.author },
    reviewBody: input.reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: input.ratingValue,
      bestRating: 5,
    },
    itemReviewed: { '@type': 'Organization', name: input.itemReviewed },
    url: input.url,
  };
}

/** CollectionPage schema for client success hub. */
export function buildCollectionPageSchema(input: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: input.url,
  };
}

/** Future-ready FAQ schema builder. */
export function buildFaqSchema(
  items: Array<{ question: string; answer: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildGlobalStructuredData(input: {
  organization: OrganizationSchemaInput;
  websiteDescription?: string;
}) {
  const site = getSeoSiteConfig();
  return [
    buildOrganizationSchema({
      ...input.organization,
      url: input.organization.url || site.siteUrl,
    }),
    buildWebSiteSchema({
      name: input.organization.name,
      url: site.siteUrl,
      ...(input.websiteDescription
        ? { description: input.websiteDescription }
        : {}),
    }),
  ];
}
