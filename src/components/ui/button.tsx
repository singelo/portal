import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl border text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'border-primary bg-primary px-4 py-2.5 text-primary-foreground hover:bg-primary/92',
        secondary: 'border-border-strong bg-surface-muted px-4 py-2.5 text-foreground hover:bg-white',
        ghost: 'border-transparent bg-transparent px-3 py-2 text-muted-foreground hover:bg-black/5 hover:text-foreground',
        outline: 'border-border-strong bg-white px-4 py-2.5 text-foreground hover:bg-surface-muted',
        danger: 'border-danger bg-danger px-4 py-2.5 text-white hover:bg-danger/95',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        md: 'h-11 px-4',
        lg: 'h-12 px-5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
