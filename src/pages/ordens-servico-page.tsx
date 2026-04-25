import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Pencil, PlusCircle, RefreshCw, Search, Trash2 } from 'lucide-react';
import { SectionHeading } from '../components/section-heading';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Table, TableWrapper, TBodyCell, THeadCell } from '../components/ui/table';
import { formatCurrency } from '../lib/format';
import { OrdemServicoItemModal, OrdemServicoModal, OrdemServicoStatusModal, PropostaModal } from '../features/operacao/action-modals';
import { deleteOrdemServico, deleteOrdemServicoItem, generateOrdemServicoPdf } from '../services/mutations';
import { fetchOrdemServicoDetails, fetchOrdensServico, queryKeys } from '../services/queries';
import type { OrdemServico, OrdemServicoItem } from '../types/api';

export function OrdensServicoPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [propostaOpen, setPropostaOpen] = useState(false);
  const [editingOs, setEditingOs] = useState<OrdemServico | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OrdemServicoItem | null>(null);
  const [selectedOsId, setSelectedOsId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'open' | 'progress' | 'done'>('all');
  const [page, setPage] = useState(0);
  const pageSize = 6;

  const ordensQuery = useQuery({
    queryKey: queryKeys.ordensServico,
    queryFn: fetchOrdensServico,
    staleTime: 2 * 60_000,
  });

  useEffect(() => {
    if (!selectedOsId && ordensQuery.data?.length) {
      setSelectedOsId(ordensQuery.data[0].id);
    }
  }, [ordensQuery.data, selectedOsId]);

  const detailsQuery = useQuery({
    enabled: Boolean(selectedOsId),
    queryKey: queryKeys.ordemServicoDetails(selectedOsId ?? ''),
    queryFn: () => fetchOrdemServicoDetails(selectedOsId ?? ''),
    staleTime: 60_000,
  });

  const deleteItemMutation = useMutation({
    mutationFn: deleteOrdemServicoItem,
    onSuccess: async () => {
      if (!selectedOsId) return;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.ordensServico }),
        queryClient.invalidateQueries({ queryKey: queryKeys.ordemServicoDetails(selectedOsId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary }),
      ]);
    },
  });

  const generatePdfMutation = useMutation({
    mutationFn: generateOrdemServicoPdf,
    onSuccess: (url) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    },
  });

  const deleteOsMutation = useMutation({
    mutationFn: deleteOrdemServico,
    onSuccess: async (_, deletedOsId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.ordensServico }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.ordemServicoDetails(deletedOsId) }),
      ]);
      setSelectedOsId(null);
    },
  });

  const ordens = useMemo(() => {
    return [...(ordensQuery.data ?? [])].sort(sortOrdensByRecency);
  }, [ordensQuery.data]);
  const filteredOrdens = useMemo(() => {
    return ordens.filter((ordem) => {
      const haystack = [ordem.id, ordem.clienteNome, ordem.descricao, ordem.status].join(' ').toLowerCase();
      const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
      const matchesDate = !dateFilter || normalizeDateForInput(ordem.dataAbertura) === dateFilter;
      const matchesQuickFilter =
        quickFilter === 'all'
          ? true
          : quickFilter === 'open'
            ? isOpenStatus(ordem.status)
            : quickFilter === 'progress'
              ? isProgressStatus(ordem.status)
              : isDoneStatus(ordem.status);

      return matchesSearch && matchesDate && matchesQuickFilter;
    });
  }, [dateFilter, ordens, quickFilter, search]);
  const totalPages = Math.max(1, Math.ceil(filteredOrdens.length / pageSize));
  const pagedOrdens = useMemo(() => {
    const start = page * pageSize;
    return filteredOrdens.slice(start, start + pageSize);
  }, [filteredOrdens, page]);
  const selectedDetails = detailsQuery.data;
  const selectedOs = selectedDetails?.os ?? null;
  const selectedItens = selectedDetails?.itens ?? [];
  const selectedTotal = useMemo(
    () => selectedItens.reduce((total, item) => total + Number(item.total ?? 0), 0),
    [selectedItens],
  );

  useEffect(() => {
    setPage(0);
  }, [dateFilter, quickFilter, search]);

  useEffect(() => {
    const safeMaxPage = Math.max(0, Math.ceil(filteredOrdens.length / pageSize) - 1);
    if (page > safeMaxPage) {
      setPage(safeMaxPage);
    }
  }, [filteredOrdens.length, page]);

  useEffect(() => {
    if (!filteredOrdens.length) {
      setSelectedOsId(null);
      return;
    }

    const hasSelected = filteredOrdens.some((ordem) => ordem.id === selectedOsId);
    if (!hasSelected) {
      setSelectedOsId(filteredOrdens[0].id);
    }
  }, [filteredOrdens, selectedOsId]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Operacao"
          title="Ordens de servico"
          description=""
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" onClick={() => setPropostaOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Proposta
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova OS
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="fade-up">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Fila de OS</CardTitle>
              <CardDescription className="mt-2">Lista principal das ordens ativas.</CardDescription>
            </div>
            <Button disabled={ordensQuery.isFetching} variant="outline" onClick={() => void ordensQuery.refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {ordensQuery.isFetching ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>

          {ordensQuery.isError ? <InlineError message={(ordensQuery.error as Error).message} /> : null}

          <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-11"
                placeholder="Buscar por cliente, descricao ou OS"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <QuickFilterButton active={quickFilter === 'all'} onClick={() => setQuickFilter('all')}>
              Todas
            </QuickFilterButton>
            <QuickFilterButton active={quickFilter === 'open'} onClick={() => setQuickFilter('open')}>
              Abertas
            </QuickFilterButton>
            <QuickFilterButton active={quickFilter === 'progress'} onClick={() => setQuickFilter('progress')}>
              Em andamento
            </QuickFilterButton>
            <QuickFilterButton active={quickFilter === 'done'} onClick={() => setQuickFilter('done')}>
              Finalizadas
            </QuickFilterButton>
          </div>

          <div className="mt-6 hidden md:block">
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <THeadCell>ID</THeadCell>
                    <THeadCell>Cliente</THeadCell>
                    <THeadCell>Status</THeadCell>
                    <THeadCell>Total</THeadCell>
                  </tr>
                </thead>
                <tbody>
                  {ordensQuery.isLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <tr key={index}>
                        {Array.from({ length: 4 }).map((__, cellIndex) => (
                          <TBodyCell key={`${index}-${cellIndex}`}>
                            <div className="h-4 animate-pulse rounded-full bg-black/5" />
                          </TBodyCell>
                        ))}
                      </tr>
                    ))
                  ) : pagedOrdens.length ? (
                    pagedOrdens.map((ordem) => (
                      <tr key={ordem.id} className={selectedOsId === ordem.id ? 'bg-surface-muted' : 'transition hover:bg-surface-muted'}>
                        <TBodyCell>
                          <button
                            className="font-medium text-foreground transition hover:text-primary"
                            onClick={() => setSelectedOsId(ordem.id)}
                            type="button"
                          >
                            {formatOsCode(ordem.id)}
                          </button>
                        </TBodyCell>
                        <TBodyCell>{ordem.clienteNome || '-'}</TBodyCell>
                        <TBodyCell>
                          <Badge tone={getStatusTone(ordem.status)}>{ordem.status}</Badge>
                        </TBodyCell>
                        <TBodyCell>{formatCurrency(ordem.total ?? 0)}</TBodyCell>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <TBodyCell className="py-10 text-center text-muted-foreground" colSpan={4}>
                        Nenhuma OS cadastrada ainda.
                      </TBodyCell>
                    </tr>
                  )}
                </tbody>
              </Table>
            </TableWrapper>
          </div>

          <div className="mt-6 space-y-3 md:hidden">
            {ordensQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
                  <div className="h-4 animate-pulse rounded-full bg-black/5" />
                </div>
              ))
            ) : pagedOrdens.length ? (
              pagedOrdens.map((ordem) => (
                <button
                  key={ordem.id}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${selectedOsId === ordem.id ? 'border-primary bg-surface-muted' : 'border-border bg-surface-muted hover:border-border-strong'}`}
                  onClick={() => setSelectedOsId(ordem.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">OS-{formatOsCode(ordem.id)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{ordem.clienteNome || '-'}</p>
                    </div>
                    <Badge tone={getStatusTone(ordem.status)}>{ordem.status}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">{formatDisplayDate(ordem.dataAbertura)}</p>
                    <p className="text-sm font-medium text-foreground">{formatCurrency(ordem.total ?? 0)}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-border bg-surface-muted px-4 py-6 text-center text-sm text-muted-foreground">
                Nenhuma OS cadastrada ainda.
              </div>
            )}
          </div>

          {!ordensQuery.isLoading ? (
            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {pagedOrdens.length} de {filteredOrdens.length} ordens, mais recentes primeiro
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0}>
                  Anterior
                </Button>
                <span className="px-2 text-sm text-muted-foreground">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Proxima
                </Button>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="fade-up">
          {selectedOs ? (
            <>
              <div className="flex flex-col gap-4">
                <div>
                  <CardTitle>Ordem {formatOsCode(selectedOs.id)}</CardTitle>
                  <CardDescription className="mt-2">
                    {selectedOs.clienteNome || '-'} • {formatDisplayDate(selectedOs.dataAbertura)}
                  </CardDescription>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <Button className="w-full" variant="outline" onClick={() => setStatusModalOpen(true)}>
                    Status
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      setEditingOs(selectedOs);
                      setCreateOpen(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    className="w-full"
                    variant="secondary"
                    disabled={generatePdfMutation.isPending}
                    onClick={() => {
                      void generatePdfMutation.mutateAsync(selectedOs.id);
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {generatePdfMutation.isPending ? 'Gerando PDF...' : 'PDF'}
                  </Button>
                  <Button
                    className="w-full"
                    variant="danger"
                    disabled={deleteOsMutation.isPending}
                    onClick={() => {
                      if (!window.confirm(`Excluir a OS ${formatOsCode(selectedOs.id)} e todos os itens dela?`)) return;
                      void deleteOsMutation.mutateAsync(selectedOs.id);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleteOsMutation.isPending ? 'Excluindo...' : 'Excluir'}
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setEditingItem(null);
                      setItemModalOpen(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo item
                  </Button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard label="Status" value={selectedOs.status} />
                <MetricCard label="Itens" value={String(selectedItens.length)} />
                <MetricCard label="Total" value={formatCurrency(selectedTotal)} />
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-surface-muted px-4 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Descricao</p>
                <p className="mt-3 text-sm leading-6 text-foreground">{selectedOs.descricao || '-'}</p>
              </div>

              {detailsQuery.isError ? <InlineError message={(detailsQuery.error as Error).message} /> : null}
              {deleteItemMutation.error ? <InlineError message={(deleteItemMutation.error as Error).message} /> : null}
              {generatePdfMutation.error ? <InlineError message={(generatePdfMutation.error as Error).message} /> : null}
              {deleteOsMutation.error ? <InlineError message={(deleteOsMutation.error as Error).message} /> : null}

              <div className="mt-6 space-y-3 md:hidden">
                {detailsQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
                      <div className="h-4 animate-pulse rounded-full bg-black/5" />
                    </div>
                  ))
                ) : selectedItens.length ? (
                  selectedItens.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.tipo}</p>
                          <p className="mt-2 text-base font-medium text-foreground">{item.descricao}</p>
                        </div>
                        <Badge tone="default">Qtd {item.quantidade}</Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Unitario</p>
                          <p className="mt-1 font-medium text-foreground">{formatCurrency(item.precoUnitario)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Total</p>
                          <p className="mt-1 font-medium text-foreground">{formatCurrency(item.total)}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingItem(item);
                            setItemModalOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            if (!window.confirm('Excluir este item da OS?')) return;
                            void deleteItemMutation.mutateAsync(item.id);
                          }}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-border bg-surface-muted px-4 py-6 text-center text-sm text-muted-foreground">
                    Nenhum item cadastrado nesta OS.
                  </div>
                )}
              </div>

              <div className="mt-6 hidden md:block">
                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <THeadCell>Tipo</THeadCell>
                        <THeadCell>Descricao</THeadCell>
                        <THeadCell>Qtd</THeadCell>
                        <THeadCell>Unitario</THeadCell>
                        <THeadCell>Total</THeadCell>
                        <THeadCell>Acoes</THeadCell>
                      </tr>
                    </thead>
                    <tbody>
                      {detailsQuery.isLoading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                          <tr key={index}>
                            {Array.from({ length: 6 }).map((__, cellIndex) => (
                              <TBodyCell key={`${index}-${cellIndex}`}>
                                <div className="h-4 animate-pulse rounded-full bg-black/5" />
                              </TBodyCell>
                            ))}
                          </tr>
                        ))
                      ) : selectedItens.length ? (
                        selectedItens.map((item) => (
                          <tr key={item.id} className="transition hover:bg-surface-muted">
                            <TBodyCell>{item.tipo}</TBodyCell>
                            <TBodyCell>{item.descricao}</TBodyCell>
                            <TBodyCell>{item.quantidade}</TBodyCell>
                            <TBodyCell>{formatCurrency(item.precoUnitario)}</TBodyCell>
                            <TBodyCell>{formatCurrency(item.total)}</TBodyCell>
                            <TBodyCell>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingItem(item);
                                    setItemModalOpen(true);
                                  }}
                                >
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => {
                                    if (!window.confirm('Excluir este item da OS?')) return;
                                    void deleteItemMutation.mutateAsync(item.id);
                                  }}
                                >
                                  Excluir
                                </Button>
                              </div>
                            </TBodyCell>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <TBodyCell className="py-8 text-center text-muted-foreground" colSpan={6}>
                            Nenhum item cadastrado nesta OS.
                          </TBodyCell>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </TableWrapper>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
              <CardTitle>Selecione uma OS</CardTitle>
              <CardDescription className="mt-3">Assim que voce abrir uma ordem de servico, os detalhes aparecem aqui.</CardDescription>
            </div>
          )}
        </Card>
      </div>

      <OrdemServicoModal
        open={createOpen}
        ordem={editingOs}
        onClose={() => {
          setCreateOpen(false);
          setEditingOs(null);
        }}
      />
      <PropostaModal open={propostaOpen} onClose={() => setPropostaOpen(false)} />

      {selectedOsId ? (
        <>
          <OrdemServicoItemModal
            item={editingItem}
            onClose={() => {
              setEditingItem(null);
              setItemModalOpen(false);
            }}
            open={itemModalOpen}
            osId={selectedOsId}
          />

          <OrdemServicoStatusModal
            initialStatus={selectedOs?.status ?? 'Aberto'}
            onClose={() => setStatusModalOpen(false)}
            open={statusModalOpen}
            osId={selectedOsId}
          />
        </>
      ) : null}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-muted px-4 py-4">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function QuickFilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <Button className="rounded-full" size="sm" variant={active ? 'primary' : 'outline'} onClick={onClick}>
      {children}
    </Button>
  );
}

function InlineError({ message }: { message: string }) {
  return <div className="mt-6 rounded-2xl border border-danger/15 bg-danger/10 px-4 py-3 text-sm text-danger">{message}</div>;
}

function getStatusTone(status: string) {
  if (/finalizado|ativo|online/i.test(status)) return 'success' as const;
  if (/andamento|aguardando|pendente/i.test(status)) return 'warning' as const;
  return 'default' as const;
}

function formatOsCode(value: string) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits) return digits;

  const raw = String(value || '').trim();
  return raw || 'Sem numero';
}

function sortOrdensByRecency(a: { id: string; dataAbertura?: string }, b: { id: string; dataAbertura?: string }) {
  const dateDiff = getSortableTimestamp(b.dataAbertura) - getSortableTimestamp(a.dataAbertura);
  if (dateDiff !== 0) return dateDiff;

  return getSortableIdNumber(b.id) - getSortableIdNumber(a.id);
}

function getSortableTimestamp(value: string | undefined) {
  if (!value) return 0;

  const brMatch = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    return new Date(Number(brMatch[3]), Number(brMatch[2]) - 1, Number(brMatch[1])).getTime();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function getSortableIdNumber(value: string) {
  const digits = String(value || '').replace(/\D/g, '');
  return Number(digits || '0');
}

function isOpenStatus(status: string) {
  return /aberto|aberta|pendente|aguardando/i.test(status);
}

function isProgressStatus(status: string) {
  return /andamento|execucao|execução|analise|análise/i.test(status);
}

function isDoneStatus(status: string) {
  return /finalizado|finalizada|concluido|concluído|entregue/i.test(status);
}

function formatDisplayDate(value: string | undefined) {
  if (!value) return 'Sem data';

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('pt-BR');
  }

  return value;
}

function normalizeDateForInput(value: string | undefined) {
  if (!value) return '';

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return [
      parsed.getFullYear(),
      String(parsed.getMonth() + 1).padStart(2, '0'),
      String(parsed.getDate()).padStart(2, '0'),
    ].join('-');
  }

  const brMatch = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
  }

  return '';
}
