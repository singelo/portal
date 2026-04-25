import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, BriefcaseBusiness, CalendarClock, Users } from 'lucide-react';
import { SectionHeading } from '../components/section-heading';
import { StatCard } from '../components/stat-card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardTitle } from '../components/ui/card';
import { fetchClientes, fetchDashboardSummary, queryKeys } from '../services/queries';

export function DashboardPage() {
  const queryClient = useQueryClient();
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
        description=""
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
        <StatCard
          hint="Saude da plataforma"
          icon={CalendarClock}
          label="Status"
          value={summaryQuery.isLoading ? '...' : String(data?.status ?? 'online')}
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

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <MetricBlock label="Agenda de hoje" value={String(data?.agendaHoje ?? 0)} />
            <MetricBlock label="Faturamento do mes" value={String(data?.faturamentoMes ?? 0)} />
            <MetricBlock label="Status da API" value={String(data?.status ?? 'online')} />
          </div>

          {summaryQuery.isError ? (
            <div className="mt-6 rounded-2xl border border-danger/15 bg-danger/10 px-4 py-3 text-sm text-danger">
              {(summaryQuery.error as Error).message}
            </div>
          ) : null}
        </Card>

        <Card className="fade-up">
          <CardTitle>Proximos encaixes recomendados</CardTitle>
          <CardDescription className="mt-2">
            A estrutura ja esta pronta para receber os modulos mais comuns sem virar bagunca.
          </CardDescription>
          <div className="mt-6 space-y-3">
            {[
              'Tabela de OS com filtros, status e prioridade.',
              'Formulario de clientes com validacao forte.',
              'Timeline ou funil de propostas.',
              'Cards de alerta para vencimentos e pendencias.',
            ].map((item) => (
              <div key={item} className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
          <Button className="mt-6 w-full" variant="outline">
            Continuar evoluindo o painel
          </Button>
        </Card>
      </div>
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
