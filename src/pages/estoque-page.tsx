import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package2, PlusCircle, RefreshCw, Search, Trash2 } from 'lucide-react';
import { SectionHeading } from '../components/section-heading';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { EstoqueItemModal } from '../features/operacao/action-modals';
import { deleteStockItem } from '../services/mutations';
import { fetchStockItems, queryKeys } from '../services/queries';
import { formatCurrency } from '../lib/format';

export function EstoquePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const estoqueQuery = useQuery({
    queryKey: queryKeys.estoque,
    queryFn: fetchStockItems,
    staleTime: 2 * 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStockItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.estoque });
    },
  });

  const items = estoqueQuery.data ?? [];
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) =>
      [item.id, item.nome, item.categoria, item.localizacao, item.status].join(' ').toLowerCase().includes(term),
    );
  }, [items, search]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading eyebrow="Operacao" title="Estoque" description="" />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => setCreateOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo item
          </Button>
          <Button disabled={estoqueQuery.isFetching} variant="outline" onClick={() => void estoqueQuery.refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {estoqueQuery.isFetching ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>

      <Card className="fade-up">
        <div>
          <CardTitle>Materiais cadastrados</CardTitle>
          <CardDescription className="mt-2">
            Estoque operacional com saldo disponivel, custo e localizacao dos materiais.
          </CardDescription>
        </div>

        <div className="mt-6 relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-11"
            placeholder="Buscar por nome, categoria ou localizacao"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {estoqueQuery.isError ? (
          <div className="mt-6 rounded-2xl border border-danger/15 bg-danger/10 px-4 py-3 text-sm text-danger">
            {(estoqueQuery.error as Error).message}
          </div>
        ) : null}
        {deleteMutation.error ? (
          <div className="mt-6 rounded-2xl border border-danger/15 bg-danger/10 px-4 py-3 text-sm text-danger">
            {(deleteMutation.error as Error).message}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {estoqueQuery.isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
                <div className="h-4 animate-pulse rounded-full bg-black/5" />
              </div>
            ))
          ) : filtered.length ? (
            filtered.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-foreground shadow-soft">
                        <Package2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.nome}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          ID {item.id}
                          {item.categoria ? ` • ${item.categoria}` : ''}
                          {item.localizacao ? ` • ${item.localizacao}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge tone={item.quantidadeAtual > 0 ? 'success' : 'warning'}>{item.status || (item.quantidadeAtual > 0 ? 'Disponivel' : 'Sem estoque')}</Badge>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Metric label="Disponivel" value={formatStockAmount(item.quantidadeAtual, item.unidade)} />
                  <Metric label="Custo" value={formatCurrency(item.custoUnitario ?? 0)} />
                  <Metric label="Fluxo" value="Disponivel para OS" />
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      if (!window.confirm(`Excluir "${item.nome}" do estoque?`)) return;
                      void deleteMutation.mutateAsync(item.id);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-border bg-surface-muted px-4 py-6 text-center text-sm text-muted-foreground">
              Nenhum item de estoque encontrado.
            </div>
          )}
        </div>
      </Card>

      <EstoqueItemModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white px-4 py-4">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function formatStockAmount(value: number, unidade?: string) {
  const amount = Number.isInteger(value) ? String(value) : value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  return `${amount} ${unidade || 'un'}`.trim();
}
