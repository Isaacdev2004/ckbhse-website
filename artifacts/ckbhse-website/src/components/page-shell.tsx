import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import type { SeoFields } from '@workspace/content/schemas';
import type { BreadcrumbItem } from '@/lib/content';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageContainer } from '@/components/page-container';
import { PageHead } from '@/components/page-head';
import { SkipLink, SkipLinkTarget } from '@/components/skip-link';
import { cn } from '@workspace/ui/utils';

interface PageShellProps {
  children: ReactNode;
  /** P1 content SEO fields — drives runtime and prerender metadata. */
  seo?: SeoFields;
  /** Public route path for canonical URL generation. */
  path?: string;
  /** Element id receiving route-change focus — set on the page h1. */
  titleId?: string;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
  /** Pages with full-bleed heroes omit top padding; inner pages use pt-20. */
  withNavOffset?: boolean;
}

export function PageShell({
  children,
  seo,
  path,
  titleId = 'page-title',
  breadcrumbs,
  className = '',
  withNavOffset = true,
}: PageShellProps) {
  const mainRef = useRef<HTMLElement>(null);
  const [location] = useLocation();
  const metadataPath = path ?? location;
  const hasBreadcrumbs = Boolean(breadcrumbs?.length);

  useEffect(() => {
    const focusTarget = document.getElementById(titleId) ?? mainRef.current;
    focusTarget?.focus({ preventScroll: true });
  }, [location, titleId]);

  return (
    <>
      {seo && <PageHead seo={seo} path={metadataPath} />}
      <SkipLink />
      <SkipLinkTarget />
      <main
        ref={mainRef}
        id="main-content"
        tabIndex={-1}
        className={cn(
          'outline-none',
          withNavOffset && !hasBreadcrumbs && 'pt-20',
          className,
        )}
      >
        {hasBreadcrumbs && breadcrumbs && (
          <div
            className={cn(
              'border-b border-border/50 bg-background',
              !withNavOffset && 'pt-20',
            )}
          >
            <PageContainer>
              <Breadcrumbs items={breadcrumbs} />
            </PageContainer>
          </div>
        )}
        {children}
      </main>
    </>
  );
}
