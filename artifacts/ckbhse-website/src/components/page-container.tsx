import type { ReactNode } from 'react';
import { cn } from '@workspace/ui/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** Narrower reading width for long-form content. */
  variant?: 'default' | 'narrow';
}

const variantClasses = {
  default: 'max-w-7xl',
  narrow: 'max-w-4xl',
};

export function PageContainer({
  children,
  className,
  variant = 'default',
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
