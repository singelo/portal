import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Banknote, BriefcaseBusiness, FileText, PlusCircle, Users } from 'lucide-react';
import { SectionHeading } from '../components/section-heading';
import { StatCard } from '../components/stat-card';
import { Button } from '../components/ui/button';
import { Card, CardTitle } from '../components/ui/card';
import { ClienteModal, OrdemServicoModal, PropostaModal } from '../features/operacao/action-modals';
import { formatCurrency } from '../lib/format';
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
          hint="Soma das OS finalizadas"
          icon={Banknote}
          label="Faturamento geral"
          value={summaryQuery.isLoading ? '...' : formatCurrency(data?.faturamentoGeral ?? 0)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        
        <Card className="fade-up">
          <CardTitle>Acoes rapidas</CardTitle>
          
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
          
        </Card>
      </div>

      <ClienteModal open={clienteOpen} onClose={() => setClienteOpen(false)} />
      <OrdemServicoModal open={osOpen} onClose={() => setOsOpen(false)} />
      <PropostaModal open={propostaOpen} onClose={() => setPropostaOpen(false)} />
    </div>
  );
}
