import { useEffect, type HTMLAttributes, type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

type DialogProps = PropsWithChildren<{
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  size?: 'md' | 'lg' | 'xl';
}>;

export function Dialog({ open, title, description, onClose, size = 'md', children }: DialogProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/24 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-8">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 flex min-h-full items-start justify-center sm:items-center">
        <div
          className={cn(
            'w-full rounded-[24px] border border-border bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:max-h-[calc(100dvh-4rem)] sm:overflow-y-auto sm:rounded-[28px] sm:p-6',
            size === 'md' && 'max-w-xl',
            size === 'lg' && 'max-w-3xl',
            size === 'xl' && 'max-w-5xl',
          )}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">{title}</h2>
              {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}
            </div>

            <button
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground transition hover:text-foreground"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end', className)} {...props} />;
}
