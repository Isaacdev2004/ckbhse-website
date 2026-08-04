import { z } from 'zod';

export const seoSiteConfigSchema = z.object({
  siteUrl: z.string().url(),
  siteName: z.string().min(1),
  locale: z.string().default('en-GB'),
  language: z.string().default('en'),
  themeColor: z.string().default('#0ea5c4'),
  defaultOgImage: z.string().url(),
  twitterHandle: z.string().optional(),
});

export type SeoSiteConfig = z.infer<typeof seoSiteConfigSchema>;

const DEFAULT_SITE_URL = 'https://www.ckbhse.co.uk';

function readRuntimeEnv(): Record<string, string | undefined> {
  if (typeof process !== 'undefined' && process.env) {
    return process.env;
  }

  const importMeta = import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  };
  if (importMeta.env) {
    return importMeta.env;
  }

  return {};
}

/** Resolve SEO site config from environment with production-safe defaults. */
export function resolveSeoSiteConfig(
  env?: Record<string, string | undefined>,
): SeoSiteConfig {
  const resolvedEnv = env ?? readRuntimeEnv();
  const siteUrl = (
    resolvedEnv.SITE_URL ??
    resolvedEnv.PUBLIC_SITE_URL ??
    DEFAULT_SITE_URL
  ).replace(/\/$/, '');

  return seoSiteConfigSchema.parse({
    siteUrl,
    siteName: resolvedEnv.SITE_NAME ?? 'CKBHSE Limited',
    locale: resolvedEnv.SITE_LOCALE ?? 'en-GB',
    language: resolvedEnv.SITE_LANGUAGE ?? 'en',
    themeColor: resolvedEnv.THEME_COLOR ?? '#0ea5c4',
    defaultOgImage: resolvedEnv.OG_DEFAULT_IMAGE ?? `${siteUrl}/og-default.png`,
    twitterHandle: resolvedEnv.TWITTER_HANDLE,
  });
}

/** Singleton for build scripts and runtime (override in tests). */
let cachedConfig: SeoSiteConfig | undefined;

export function getSeoSiteConfig(): SeoSiteConfig {
  cachedConfig ??= resolveSeoSiteConfig();
  return cachedConfig;
}

export function setSeoSiteConfig(config: SeoSiteConfig): void {
  cachedConfig = config;
}

export function resetSeoSiteConfig(): void {
  cachedConfig = undefined;
}
