import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-12 w-full appearance-none rounded-2xl border border-border bg-white/80 px-4 pr-11 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-ring',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
