import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { PlusCircle, Search } from 'lucide-react';
import { SectionHeading } from '../components/section-heading';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Table, TableWrapper, TBodyCell, THeadCell } from '../components/ui/table';
import { formatDocument } from '../lib/format';
import { fetchClientes, queryKeys } from '../services/queries';
import type { Cliente } from '../types/api';
import { ClienteModal } from '../features/operacao/action-modals';

export function ClientesPage() {
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const clientesQuery = useQuery({
    queryKey: queryKeys.clientes,
    queryFn: fetchClientes,
    staleTime: 5 * 60_000,
  });

  const columns = useMemo<ColumnDef<Cliente>[]>(
    () => [
      {
        accessorKey: 'nome',
        header: 'Cliente',
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-foreground">{row.original.nome || '-'}</p>
          </div>
        ),
      },
      {
        accessorKey: 'cnpj',
        header: 'CNPJ',
        cell: ({ row }) => formatDocument(row.original.cnpj),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = String(row.original.status || 'Sem status');
          const tone = /ativo|ok|online/i.test(status) ? 'success' : /pendente/i.test(status) ? 'warning' : 'default';
          return <Badge tone={tone}>{status}</Badge>;
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: clientesQuery.data ?? [],
    columns,
    state: {
      globalFilter: search,
    },
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const haystack = [
        row.original.nome,
        row.original.telefone,
        row.original.cnpj,
        row.original.status,
        row.original.cidade,
        row.original.responsavel,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(String(filterValue).toLowerCase());
    },
  });

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Cadastro"
          title="Clientes"
          description="Base principal de clientes para atendimento, OS, proposta e historico comercial."
        />

        <Button onClick={() => setCreateOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      <Card className="fade-up">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Base de clientes</CardTitle>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative min-w-[260px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-11"
                placeholder="Buscar por nome ou CNPJ..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button variant="secondary" onClick={() => setCreateOpen(true)}>
              Novo cliente
            </Button>
          </div>
        </div>

        {clientesQuery.isError ? (
          <div className="mt-6 rounded-2xl border border-danger/15 bg-danger/10 px-4 py-3 text-sm text-danger">
            {(clientesQuery.error as Error).message}
          </div>
        ) : null}

        <div className="mt-6">
          <TableWrapper>
            <Table>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <THeadCell key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </THeadCell>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {clientesQuery.isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      {columns.map((column, columnIndex) => (
                        <TBodyCell key={`${index}-${columnIndex}`}>
                          <div className="h-4 animate-pulse rounded-full bg-black/5" />
                        </TBodyCell>
                      ))}
                    </tr>
                  ))
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr className="transition hover:bg-surface-muted" key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TBodyCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TBodyCell>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <TBodyCell className="py-10 text-center text-muted-foreground" colSpan={columns.length}>
                      Nenhum cliente encontrado.
                    </TBodyCell>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {table.getRowModel().rows.length} de {clientesQuery.data?.length ?? 0} registros
          </p>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Anterior
            </Button>
            <Button variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Proxima
            </Button>
          </div>
        </div>
      </Card>

      <ClienteModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
