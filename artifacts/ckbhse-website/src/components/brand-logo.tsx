import { Link } from 'wouter';

type BrandLogoProps = {
  href?: string;
  /** Visual size for the header / footer mark */
  size?: 'sm' | 'md' | 'lg';
  /** Use full vertical logo (footer) vs compact mark (nav) */
  variant?: 'mark' | 'full';
  className?: string;
  'data-testid'?: string;
  'aria-current'?: 'page' | undefined;
};

const heightClass = {
  sm: 'h-10',
  md: 'h-12',
  lg: 'h-16',
} as const;

/**
 * Official CKBHSE brand mark. Prefer the image asset over the old Shield icon.
 */
export function BrandLogo({
  href = '/',
  size = 'md',
  variant = 'mark',
  className = '',
  'data-testid': testId,
  'aria-current': ariaCurrent,
}: BrandLogoProps) {
  const src =
    variant === 'full'
      ? '/brand/ckbhse-logo.png'
      : '/brand/ckbhse-logo-mark.png';

  const image = (
    <img
      src={src}
      alt="CKBHSE Limited"
      className={`${heightClass[size]} w-auto object-contain group-hover:opacity-90 transition-opacity`}
      width={variant === 'full' ? 160 : 180}
      height={variant === 'full' ? 160 : 104}
      decoding="async"
    />
  );

  if (!href) {
    return <div className={`inline-flex items-center ${className}`}>{image}</div>;
  }

  return (
    <Link
      href={href}
      className={`inline-flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg ${className}`}
      data-testid={testId}
      aria-current={ariaCurrent}
      aria-label="CKBHSE Limited home"
    >
      {image}
    </Link>
  );
}
