import { Link } from 'wouter';

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg focus:outline-none"
      data-testid="link-skip-to-content"
    >
      Skip to main content
    </a>
  );
}

export function SkipLinkTarget({ id = 'main-content' }: { id?: string }) {
  return <span id={id} tabIndex={-1} className="sr-only" aria-hidden="true" />;
}

/** Visible footer skip target for keyboard users returning from page bottom. */
export function SkipNavLink() {
  return (
    <Link
      href="#site-navigation"
      className="sr-only focus:not-sr-only focus:absolute focus:bottom-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg focus:outline-none"
      data-testid="link-skip-to-navigation"
    >
      Skip to navigation
    </Link>
  );
}
