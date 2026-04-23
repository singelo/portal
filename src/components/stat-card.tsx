import type { LucideIcon } from 'lucide-react';
import { Card, CardDescription, CardTitle } from './ui/card';

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
};

export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <Card className="fade-up">
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardDescription className="text-xs uppercase tracking-[0.14em]">{label}</CardDescription>
          <CardTitle className="mt-3 text-3xl md:text-[2rem]">{value}</CardTitle>
          
        </div>
        <div className="rounded-xl border border-border bg-surface-muted p-3 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}
