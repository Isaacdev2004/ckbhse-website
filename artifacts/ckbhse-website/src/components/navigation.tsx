import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, ChevronDown } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@workspace/ui/components/button';
import { motion, AnimatePresence } from 'framer-motion';
import { contentLoader } from '@/lib/content';

function isPathActive(currentPath: string, href: string): boolean {
  const path = href.split('#')[0] ?? href;
  if (path === '/') {
    return currentPath === '/';
  }
  return currentPath === path || currentPath.startsWith(`${path}/`);
}

function isGroupActive(
  currentPath: string,
  groupHref: string,
  children: { href: string; available: boolean }[],
): boolean {
  if (isPathActive(currentPath, groupHref)) {
    return true;
  }
  return children.some(
    (child) => child.available && isPathActive(currentPath, child.href),
  );
}

interface NavDropdownProps {
  group: ReturnType<typeof contentLoader.getSiteConfig>['navigation'][number];
  currentPath: string;
  onNavigate: () => void;
}

function DesktopNavGroup({ group, currentPath, onNavigate }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const active = isGroupActive(currentPath, group.href, group.children);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener('mousedown', handlePointer);
    return () => document.removeEventListener('mousedown', handlePointer);
  }, [open, close]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={`inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary relative py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm ${
          active ? 'text-foreground' : 'text-muted-foreground'
        }`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-current={active ? 'page' : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            close();
          }
        }}
        data-testid={`button-nav-group-${group.id}`}
      >
        {group.label}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
        {active && (
          <motion.div
            layoutId="activeNav"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 min-w-[14rem] rounded-xl border border-border bg-background/98 p-2 shadow-lg backdrop-blur-md"
            role="menu"
          >
            <Link
              href={group.href}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              role="menuitem"
              onClick={() => {
                close();
                onNavigate();
              }}
              data-testid={`link-nav-${group.id}-hub`}
            >
              All {group.label}
            </Link>
            <div className="my-1 h-px bg-border" />
            {group.children.map((child) =>
              child.available ? (
                <Link
                  key={child.href + child.label}
                  href={child.href}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  role="menuitem"
                  aria-current={
                    isPathActive(currentPath, child.href) ? 'page' : undefined
                  }
                  onClick={() => {
                    close();
                    onNavigate();
                  }}
                  data-testid={`link-nav-${child.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {child.label}
                </Link>
              ) : (
                <span
                  key={child.label}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground/50 cursor-default"
                  role="menuitem"
                  aria-disabled="true"
                >
                  {child.label}
                  <span className="sr-only"> (coming soon)</span>
                </span>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileNavGroup({ group, currentPath, onNavigate }: NavDropdownProps) {
  const [expanded, setExpanded] = useState(false);
  const active = isGroupActive(currentPath, group.href, group.children);

  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <button
        type="button"
        className={`flex w-full items-center justify-between px-4 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
          active
            ? 'bg-primary/10 text-foreground'
            : 'text-foreground hover:bg-muted'
        }`}
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        data-testid={`button-mobile-group-${group.id}`}
      >
        {group.label}
        <ChevronDown
          className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-muted/30"
          >
            <div className="space-y-1 px-2 py-2">
              <Link
                href={group.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                  isPathActive(currentPath, group.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
                onClick={onNavigate}
              >
                All {group.label}
              </Link>
              {group.children.map((child) =>
                child.available ? (
                  <Link
                    key={child.href + child.label}
                    href={child.href}
                    className={`block rounded-lg px-3 py-2 text-sm ${
                      isPathActive(currentPath, child.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    aria-current={
                      isPathActive(currentPath, child.href) ? 'page' : undefined
                    }
                    onClick={onNavigate}
                    data-testid={`link-mobile-${child.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {child.label}
                  </Link>
                ) : (
                  <span
                    key={child.label}
                    className="block rounded-lg px-3 py-2 text-sm text-muted-foreground/50"
                    aria-disabled="true"
                  >
                    {child.label}
                  </span>
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navigation() {
  const site = contentLoader.getSiteConfig();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [renderedLocation, setRenderedLocation] = useState(location);
  if (renderedLocation !== location) {
    setRenderedLocation(location);
    setMobileMenuOpen(false);
  }

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <motion.nav
      id="site-navigation"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
      aria-label="Primary"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <BrandLogo
            href="/"
            size="md"
            variant="mark"
            data-testid="link-home-logo"
            aria-current={location === '/' ? 'page' : undefined}
          />

          <div className="hidden lg:flex items-center gap-6">
            {site.navigation.map((group) => (
              <DesktopNavGroup
                key={group.id}
                group={group}
                currentPath={location}
                onNavigate={() => undefined}
              />
            ))}
          </div>

          <div className="hidden lg:block">
            <Link
              href={site.cta.href}
              data-testid="button-book-consultation-desktop"
            >
              <Button size="lg" className="font-semibold">
                {site.cta.label}
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 min-w-11 min-h-11 text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-panel"
            data-testid="button-mobile-menu-toggle"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-navigation-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-border bg-background/98 backdrop-blur-md"
          >
            <div className="px-4 py-6 space-y-3 max-h-[calc(100vh-5rem)] overflow-y-auto">
              {site.navigation.map((group) => (
                <MobileNavGroup
                  key={group.id}
                  group={group}
                  currentPath={location}
                  onNavigate={closeMobileMenu}
                />
              ))}
              <Link
                href={site.cta.href}
                className="block pt-2"
                onClick={closeMobileMenu}
                data-testid="button-book-consultation-mobile"
              >
                <Button size="lg" className="w-full font-semibold min-h-11">
                  {site.cta.label}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
