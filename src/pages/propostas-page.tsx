import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, FileText, RefreshCw, Search } from 'lucide-react';
import { SectionHeading } from '../components/section-heading';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { fetchProposalFiles, queryKeys } from '../services/queries';
import type { ProposalFile } from '../types/api';

export function PropostasPage() {
  const [search, setSearch] = useState('');

  const propostasQuery = useQuery({
    queryKey: queryKeys.propostas,
    queryFn: fetchProposalFiles,
    staleTime: 2 * 60_000,
  });

  const arquivos = propostasQuery.data ?? [];
  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return arquivos;

    return arquivos.filter((arquivo) =>
      [arquivo.name, arquivo.createdAt, arquivo.updatedAt].join(' ').toLowerCase().includes(term),
    );
  }, [arquivos, search]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading eyebrow="Arquivos" title="Propostas" description="" />

        <Button disabled={propostasQuery.isFetching} variant="outline" onClick={() => void propostasQuery.refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {propostasQuery.isFetching ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      <Card className="fade-up">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Arquivos gerados</CardTitle>
            <CardDescription className="mt-2">Lista dos PDFs de propostas já salvos.</CardDescription>
          </div>
        </div>

        <div className="mt-6 relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-11"
            placeholder="Buscar por nome do arquivo"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {propostasQuery.isError ? (
          <div className="mt-6 rounded-2xl border border-danger/15 bg-danger/10 px-4 py-3 text-sm text-danger">
            {(propostasQuery.error as Error).message}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {propostasQuery.isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
                <div className="h-4 animate-pulse rounded-full bg-black/5" />
              </div>
            ))
          ) : filtrados.length ? (
            filtrados.map((arquivo) => (
              <ArquivoCard key={arquivo.id || arquivo.url} arquivo={arquivo} />
            ))
          ) : (
            <div className="rounded-2xl border border-border bg-surface-muted px-4 py-6 text-center text-sm text-muted-foreground">
              Nenhuma proposta encontrada.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function ArquivoCard({ arquivo }: { arquivo: ProposalFile }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-foreground shadow-soft">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{arquivo.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatFileDate(arquivo.updatedAt || arquivo.createdAt)}
                {arquivo.sizeBytes ? ` • ${formatFileSize(arquivo.sizeBytes)}` : ''}
              </p>
            </div>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            window.open(arquivo.url, '_blank', 'noopener,noreferrer');
          }}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Abrir
        </Button>
      </div>
    </div>
  );
}

function formatFileDate(value: string | undefined) {
  if (!value) return 'Sem data';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(value: number) {
  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (value >= 1024) {
    return `${Math.round(value / 1024)} KB`;
  }

  return `${value} B`;
}
