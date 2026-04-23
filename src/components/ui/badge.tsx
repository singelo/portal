import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'default' | 'success' | 'warning';
};

export function Badge({ className, tone = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium',
        tone === 'default' && 'border-border bg-surface-muted text-foreground',
        tone === 'success' && 'border-success/15 bg-success/10 text-success',
        tone === 'warning' && 'border-border bg-surface-muted text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}
