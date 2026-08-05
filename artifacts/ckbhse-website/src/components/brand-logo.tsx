import { Link } from 'wouter';

type BrandLogoProps = {
  href?: string;
  /** Visual size for the header / footer mark */
  size?: 'sm' | 'md' | 'lg';
  /**
   * `header` — horizontal lockup (badge + wordmark) for nav bars
   * `full` — complete vertical logo for footer / large placements
   * `icon` — badge only
   */
  variant?: 'header' | 'full' | 'icon';
  className?: string;
  'data-testid'?: string;
  'aria-current'?: 'page' | undefined;
};

const iconSizeClass = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
} as const;

const fullHeightClass = {
  sm: 'h-14',
  md: 'h-20',
  lg: 'h-28',
} as const;

/**
 * Official CKBHSE brand mark.
 * Header uses a horizontal lockup so the tall vertical logo is never clipped.
 */
export function BrandLogo({
  href = '/',
  size = 'md',
  variant = 'header',
  className = '',
  'data-testid': testId,
  'aria-current': ariaCurrent,
}: BrandLogoProps) {
  let content: React.ReactNode;

  if (variant === 'full') {
    content = (
      <img
        src="/brand/ckbhse-logo.png"
        alt="CKBHSE Limited — HSE Consultancy"
        className={`${fullHeightClass[size]} w-auto max-w-[180px] object-contain object-left group-hover:opacity-90 transition-opacity`}
        width={180}
        height={180}
        decoding="async"
      />
    );
  } else if (variant === 'icon') {
    content = (
      <img
        src="/brand/ckbhse-icon.png"
        alt="CKBHSE Limited"
        className={`${iconSizeClass[size]} object-contain group-hover:opacity-90 transition-opacity`}
        width={44}
        height={44}
        decoding="async"
      />
    );
  } else {
    // Horizontal header lockup: badge + wordmark (fits h-20 nav without clipping)
    content = (
      <span className="inline-flex items-center gap-2.5">
        <img
          src="/brand/ckbhse-icon.png"
          alt=""
          className={`${iconSizeClass[size]} shrink-0 object-contain`}
          width={44}
          height={44}
          decoding="async"
        />
        <span className="flex flex-col leading-none">
          <span className="font-display font-bold text-[1.05rem] tracking-tight sm:text-lg">
            <span className="text-[#0B2447]">CKB</span>
            <span className="text-[#00A651]">HSE</span>
          </span>
          <span className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0B2447]/70">
            Limited
          </span>
        </span>
      </span>
    );
  }

  if (!href) {
    return <div className={`inline-flex items-center ${className}`}>{content}</div>;
  }

  return (
    <Link
      href={href}
      className={`inline-flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg ${className}`}
      data-testid={testId}
      aria-current={ariaCurrent}
      aria-label="CKBHSE Limited home"
    >
      {content}
    </Link>
  );
}
