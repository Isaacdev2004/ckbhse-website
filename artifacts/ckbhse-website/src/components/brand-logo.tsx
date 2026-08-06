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

/** Brand light-blue plate — matches official logo background for contrast on dark heroes */
const BRAND_PLATE = 'bg-[#E8F4FC]';

const iconSizeClass = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
} as const;

const fullHeightClass = {
  sm: 'h-14',
  md: 'h-20',
  lg: 'h-28',
} as const;

/**
 * Official CKBHSE brand mark.
 * Header uses a horizontal lockup on a light-blue plate so navy/green
 * wordmark stays readable over dark hero photography.
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
      <span
        className={`inline-flex items-center justify-center rounded-lg ${BRAND_PLATE} p-1`}
      >
        <img
          src="/brand/ckbhse-icon.png"
          alt="CKBHSE Limited"
          className={`${iconSizeClass[size]} object-contain`}
          width={40}
          height={40}
          decoding="async"
        />
      </span>
    );
  } else {
    content = (
      <span
        className={`inline-flex items-center gap-2 rounded-xl ${BRAND_PLATE} px-2.5 py-1.5 shadow-sm ring-1 ring-[#0B2447]/10`}
      >
        <img
          src="/brand/ckbhse-icon.png"
          alt=""
          className={`${iconSizeClass[size]} shrink-0 object-contain`}
          width={40}
          height={40}
          decoding="async"
        />
        <span className="flex flex-col leading-none pr-1">
          <span className="font-display font-bold text-[1.05rem] tracking-tight sm:text-lg">
            <span className="text-[#0B2447]">CKB</span>
            <span className="text-[#00A651]">HSE</span>
          </span>
          <span className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0B2447]/80">
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
      className={`inline-flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl ${className}`}
      data-testid={testId}
      aria-current={ariaCurrent}
      aria-label="CKBHSE Limited home"
    >
      {content}
    </Link>
  );
}
