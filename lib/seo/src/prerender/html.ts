import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  buildPageMetadata,
  renderJsonLd,
  renderMetadataHeadTags,
} from '../metadata.js';
import type { PublicRouteDefinition } from '../routes.js';
import { buildGlobalStructuredData } from '../schema/index.js';
import { contentLoader } from '@workspace/content/loader';

const METADATA_MARKER_START = '<!-- seo:metadata:start -->';
const METADATA_MARKER_END = '<!-- seo:metadata:end -->';
const JSONLD_MARKER_START = '<!-- seo:jsonld:start -->';
const JSONLD_MARKER_END = '<!-- seo:jsonld:end -->';

export interface PrerenderHtmlOptions {
  distDir: string;
  basePath?: string;
  routes: PublicRouteDefinition[];
}

function buildGlobalJsonLd(): string {
  const site = contentLoader.getSiteConfig();
  const schemas = buildGlobalStructuredData({
    organization: {
      name: site.brand.name,
      url: '',
      email: site.contact.email,
      telephone: site.contact.phone,
      addressLocality: site.contact.location,
      addressCountry: 'GB',
    },
    websiteDescription: `${site.brand.tagline} ${site.brand.description}`,
  });
  return renderJsonLd(schemas);
}

/** Inject per-route metadata and write prerendered HTML shells. */
export function prerenderHtmlShells(options: PrerenderHtmlOptions): void {
  const indexPath = join(options.distDir, 'index.html');
  const template = readFileSync(indexPath, 'utf8');
  const globalJsonLd = buildGlobalJsonLd();

  for (const route of options.routes) {
    const metadata = buildPageMetadata({
      seo: route.getSeo(),
      path: route.path,
      ...(options.basePath
        ? { canonicalOptions: { basePath: options.basePath } }
        : {}),
    });

    const headTags = [
      METADATA_MARKER_START,
      renderMetadataHeadTags(metadata),
      METADATA_MARKER_END,
      JSONLD_MARKER_START,
      globalJsonLd,
      JSONLD_MARKER_END,
    ].join('\n    ');

    const html = injectHeadContent(template, headTags);
    const outputPath =
      route.path === '/'
        ? indexPath
        : join(options.distDir, route.path.slice(1), 'index.html');

    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, html, 'utf8');
  }
}

function injectHeadContent(template: string, headContent: string): string {
  const html = stripSeoMarkers(template);

  if (html.includes('<!-- seo:inject -->')) {
    return html.replace('<!-- seo:inject -->', headContent);
  }

  return html.replace('</head>', `    ${headContent}\n  </head>`);
}

function stripSeoMarkers(html: string): string {
  return html
    .replace(
      new RegExp(
        `${escapeRegExp(METADATA_MARKER_START)}[\\s\\S]*?${escapeRegExp(METADATA_MARKER_END)}\\s*`,
        'g',
      ),
      '',
    )
    .replace(
      new RegExp(
        `${escapeRegExp(JSONLD_MARKER_START)}[\\s\\S]*?${escapeRegExp(JSONLD_MARKER_END)}\\s*`,
        'g',
      ),
      '',
    )
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta name="description"[^>]*>\s*/i, '')
    .replace(/<meta name="robots"[^>]*>\s*/i, '')
    .replace(/<link rel="canonical"[^>]*>\s*/i, '')
    .replace(/<meta property="og:[^"]+"[^>]*>\s*/gi, '')
    .replace(/<meta name="twitter:[^"]+"[^>]*>\s*/gi, '')
    .replace(/<meta name="theme-color"[^>]*>\s*/i, '');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
