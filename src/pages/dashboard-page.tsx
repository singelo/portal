import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, BriefcaseBusiness, FileText, PlusCircle, Users } from 'lucide-react';
import { SectionHeading } from '../components/section-heading';
import { StatCard } from '../components/stat-card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardTitle } from '../components/ui/card';
import { ClienteModal, OrdemServicoModal, PropostaModal } from '../features/operacao/action-modals';
import { fetchClientes, fetchDashboardSummary, queryKeys } from '../services/queries';

export function DashboardPage() {
  const queryClient = useQueryClient();
  const [clienteOpen, setClienteOpen] = useState(false);
  const [osOpen, setOsOpen] = useState(false);
  const [propostaOpen, setPropostaOpen] = useState(false);
  const summaryQuery = useQuery({
    queryKey: queryKeys.dashboardSummary,
    queryFn: fetchDashboardSummary,
    staleTime: 2 * 60_000,
  });

  const data = summaryQuery.data;

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.clientes,
      queryFn: fetchClientes,
      staleTime: 5 * 60_000,
    });
  }, [queryClient]);

  return (
    <div className="space-y-6 md:space-y-8">
      <SectionHeading
        eyebrow="Visao operacional"
        title="Dashboard"
        description="Leitura rapida do negocio com atalhos para cadastros e fluxos mais usados."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          hint="Base ativa cadastrada"
          icon={Users}
          label="Clientes"
          value={summaryQuery.isLoading ? '...' : String(data?.clientes ?? 0)}
        />
        <StatCard
          hint="Itens em andamento"
          icon={BriefcaseBusiness}
          label="OS abertas"
          value={summaryQuery.isLoading ? '...' : String(data?.osAbertas ?? 0)}
        />
        <StatCard
          hint="Pendencias comerciais"
          icon={Activity}
          label="Propostas"
          value={summaryQuery.isLoading ? '...' : String(data?.propostasPendentes ?? 0)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="fade-up">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Direcao da operacao</CardTitle>
              <CardDescription className="mt-2">
                Esta area pode virar o seu cockpit principal com mais blocos de KPI, agenda, contas, OS e vendas.
              </CardDescription>
            </div>
            <Badge tone="success">Base pronta para crescer</Badge>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <MetricBlock label="Agenda de hoje" value={String(data?.agendaHoje ?? 0)} />
            <MetricBlock label="Faturamento do mes" value={String(data?.faturamentoMes ?? 0)} />
          </div>

          {summaryQuery.isError ? (
            <div className="mt-6 rounded-2xl border border-danger/15 bg-danger/10 px-4 py-3 text-sm text-danger">
              {(summaryQuery.error as Error).message}
            </div>
          ) : null}
        </Card>

        <Card className="fade-up">
          <CardTitle>Acoes rapidas</CardTitle>
          <CardDescription className="mt-2">
            Atalhos para abrir cadastro, ordem de servico e proposta sem sair do fluxo principal.
          </CardDescription>
          <div className="mt-6 space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={() => setClienteOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo cliente
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => setOsOpen(true)}>
              <BriefcaseBusiness className="mr-2 h-4 w-4" />
              Nova ordem de servico
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => setPropostaOpen(true)}>
              <FileText className="mr-2 h-4 w-4" />
              Gerar proposta
            </Button>
          </div>
          <div className="mt-6 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm leading-6 text-muted-foreground">
            Esse bloco substitui os atalhos improvisados do sistema antigo e centraliza os modais mais usados.
          </div>
        </Card>
      </div>

      <ClienteModal open={clienteOpen} onClose={() => setClienteOpen(false)} />
      <OrdemServicoModal open={osOpen} onClose={() => setOsOpen(false)} />
      <PropostaModal open={propostaOpen} onClose={() => setPropostaOpen(false)} />
    </div>
  );
}

type MetricBlockProps = {
  label: string;
  value: string;
};

function MetricBlock({ label, value }: MetricBlockProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-muted px-4 py-4">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
