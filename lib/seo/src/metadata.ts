import { z } from 'zod';
import type { SeoFields } from '@workspace/content/schemas';
import { resolveCanonicalUrl, type CanonicalOptions } from './canonical.js';
import { getSeoSiteConfig } from './config.js';

export const pageMetadataSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  path: z.string().min(1),
  canonical: z.string().url(),
  ogImage: z.string().url(),
  ogType: z.enum(['website', 'article']).default('website'),
  locale: z.string(),
  language: z.string(),
  siteName: z.string(),
  themeColor: z.string(),
  robots: z.string(),
  noindex: z.boolean(),
  alternates: z
    .array(
      z.object({
        hreflang: z.string(),
        href: z.string().url(),
      }),
    )
    .default([]),
  twitterCard: z
    .enum(['summary', 'summary_large_image'])
    .default('summary_large_image'),
  twitterHandle: z.string().optional(),
});

export type PageMetadata = z.infer<typeof pageMetadataSchema>;

export interface BuildPageMetadataInput {
  seo: SeoFields;
  path: string;
  ogType?: 'website' | 'article';
  alternates?: PageMetadata['alternates'];
  canonicalOptions?: CanonicalOptions;
}

/** Compose full page metadata from P1 SEO fields and route path. */
export function buildPageMetadata(input: BuildPageMetadataInput): PageMetadata {
  const site = getSeoSiteConfig();
  const canonical = resolveCanonicalUrl(
    input.path,
    input.seo.canonical,
    input.canonicalOptions,
  );
  const ogImage = resolveOgImage(
    input.seo.ogImage,
    site.defaultOgImage,
    site.siteUrl,
  );
  const noindex = input.seo.noindex ?? false;

  return pageMetadataSchema.parse({
    title: input.seo.title,
    description: input.seo.description,
    path: input.path,
    canonical,
    ogImage,
    ogType: input.ogType ?? 'website',
    locale: site.locale,
    language: site.language,
    siteName: site.siteName,
    themeColor: site.themeColor,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    noindex,
    alternates: input.alternates ?? [],
    twitterCard: 'summary_large_image',
    twitterHandle: site.twitterHandle,
  });
}

function resolveOgImage(
  explicit: string | undefined,
  defaultImage: string,
  siteUrl: string,
): string {
  if (!explicit) {
    return defaultImage;
  }
  if (explicit.startsWith('http://') || explicit.startsWith('https://')) {
    return explicit;
  }
  const path = explicit.startsWith('/') ? explicit : `/${explicit}`;
  return `${siteUrl.replace(/\/$/, '')}${path}`;
}

export function validatePageMetadata(data: unknown): PageMetadata {
  return pageMetadataSchema.parse(data);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Render metadata as HTML head tags for prerender injection. */
export function renderMetadataHeadTags(metadata: PageMetadata): string {
  const tags: string[] = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
    `<meta name="robots" content="${escapeHtml(metadata.robots)}" />`,
    `<link rel="canonical" href="${escapeHtml(metadata.canonical)}" />`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta property="og:type" content="${escapeHtml(metadata.ogType)}" />`,
    `<meta property="og:url" content="${escapeHtml(metadata.canonical)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(metadata.siteName)}" />`,
    `<meta property="og:locale" content="${escapeHtml(metadata.locale)}" />`,
    `<meta property="og:image" content="${escapeHtml(metadata.ogImage)}" />`,
    `<meta name="twitter:card" content="${escapeHtml(metadata.twitterCard)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(metadata.ogImage)}" />`,
    `<meta name="theme-color" content="${escapeHtml(metadata.themeColor)}" />`,
  ];

  if (metadata.twitterHandle) {
    tags.push(
      `<meta name="twitter:site" content="@${escapeHtml(metadata.twitterHandle.replace(/^@/, ''))}" />`,
    );
  }

  for (const alternate of metadata.alternates) {
    tags.push(
      `<link rel="alternate" hreflang="${escapeHtml(alternate.hreflang)}" href="${escapeHtml(alternate.href)}" />`,
    );
  }

  return tags.join('\n    ');
}

/** Render JSON-LD script tag. */
export function renderJsonLd(
  data: Record<string, unknown> | Record<string, unknown>[],
): string {
  const payload = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${payload}</script>`;
}
