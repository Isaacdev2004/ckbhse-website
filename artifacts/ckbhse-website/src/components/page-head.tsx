import { useEffect } from 'react';
import type { SeoFields } from '@workspace/content/schemas';
import { buildPageMetadata, type PageMetadata } from '@workspace/seo/metadata';

interface PageHeadProps {
  seo: SeoFields;
  path: string;
}

const MANAGED_SELECTOR = 'data-seo-managed';

function upsertMeta(
  attribute: 'name' | 'property',
  key: string,
  content: string,
): void {
  let element = document.head.querySelector(
    `meta[${attribute}="${key}"][${MANAGED_SELECTOR}]`,
  ) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    element.setAttribute(MANAGED_SELECTOR, 'true');
    document.head.appendChild(element);
  }

  element.content = content;
}

function upsertLink(rel: string, href: string, hreflang?: string): void {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"][${MANAGED_SELECTOR}]`
    : `link[rel="${rel}"][${MANAGED_SELECTOR}]`;
  let element = document.head.querySelector(selector) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    element.setAttribute(MANAGED_SELECTOR, 'true');
    if (hreflang) {
      element.hreflang = hreflang;
    }
    document.head.appendChild(element);
  }

  element.href = href;
}

function applyMetadata(metadata: PageMetadata): void {
  document.title = metadata.title;
  document.documentElement.lang = metadata.language;

  upsertMeta('name', 'description', metadata.description);
  upsertMeta('name', 'robots', metadata.robots);
  upsertMeta('name', 'theme-color', metadata.themeColor);
  upsertLink('canonical', metadata.canonical);

  upsertMeta('property', 'og:title', metadata.title);
  upsertMeta('property', 'og:description', metadata.description);
  upsertMeta('property', 'og:type', metadata.ogType);
  upsertMeta('property', 'og:url', metadata.canonical);
  upsertMeta('property', 'og:site_name', metadata.siteName);
  upsertMeta('property', 'og:locale', metadata.locale);
  upsertMeta('property', 'og:image', metadata.ogImage);

  upsertMeta('name', 'twitter:card', metadata.twitterCard);
  upsertMeta('name', 'twitter:title', metadata.title);
  upsertMeta('name', 'twitter:description', metadata.description);
  upsertMeta('name', 'twitter:image', metadata.ogImage);

  if (metadata.twitterHandle) {
    upsertMeta(
      'name',
      'twitter:site',
      `@${metadata.twitterHandle.replace(/^@/, '')}`,
    );
  }

  document.head
    .querySelectorAll(`link[rel="alternate"][${MANAGED_SELECTOR}]`)
    .forEach((node) => node.remove());

  for (const alternate of metadata.alternates) {
    upsertLink('alternate', alternate.href, alternate.hreflang);
  }
}

export function PageHead({ seo, path }: PageHeadProps) {
  useEffect(() => {
    const metadata = buildPageMetadata({ seo, path });
    applyMetadata(metadata);
  }, [seo, path]);

  return null;
}

/** Inject global JSON-LD once at app boot. */
export function GlobalStructuredData({
  data,
}: {
  data: Record<string, unknown>[];
}) {
  useEffect(() => {
    const existing = document.getElementById('global-jsonld');
    if (existing) {
      existing.textContent = JSON.stringify(data);
      return;
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'global-jsonld';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }, [data]);

  return null;
}
