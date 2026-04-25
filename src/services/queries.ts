import { apiRequest } from './api';
import type { Cliente, DashboardSummary, OrdemServico, OrdemServicoDetails, ProposalFile, StockItem } from '../types/api';

export const queryKeys = {
  dashboardSummary: ['dashboard-summary'] as const,
  clientes: ['clientes'] as const,
  estoque: ['estoque'] as const,
  propostas: ['propostas'] as const,
  ordensServico: ['ordens-servico'] as const,
  ordemServicoDetails: (osId: string) => ['ordens-servico', osId] as const,
};

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const result = await apiRequest('dashboard.summary');
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao carregar o dashboard.');
  }

  return result.data;
}

export async function fetchClientes(): Promise<Cliente[]> {
  const result = await apiRequest('clientes.list');
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao carregar clientes.');
  }

  return result.data.map(normalizeCliente);
}

export async function fetchProposalFiles(): Promise<ProposalFile[]> {
  const result = await apiRequest('propostas.list');
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao carregar arquivos de propostas.');
  }

  return (result.data ?? []).map(normalizeProposalFile);
}

export async function fetchStockItems(): Promise<StockItem[]> {
  const result = await apiRequest('estoque.list');
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao carregar estoque.');
  }

  return (result.data ?? []).map(normalizeStockItem);
}

export async function fetchOrdensServico(): Promise<OrdemServico[]> {
  const result = await apiRequest('os.list');
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao carregar ordens de servico.');
  }

  return result.data.map(normalizeOrdemServico);
}

export async function fetchOrdemServicoDetails(osId: string): Promise<OrdemServicoDetails> {
  const result = await apiRequest('os.details', { osId });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao carregar os detalhes da OS.');
  }

  return {
    os: normalizeOrdemServico(result.data.os),
    itens: (result.data.itens ?? []).map((item) => ({
      id: item.id ?? (item as Record<string, unknown>).id_item ?? '',
      osId: String(item.osId ?? (item as Record<string, unknown>).os_id ?? ''),
      estoqueItemId: String(item.estoqueItemId ?? (item as Record<string, unknown>).estoque_item_id ?? ''),
      tipo: String(item.tipo ?? ''),
      descricao: String(item.descricao ?? ''),
      quantidade: Number(item.quantidade ?? 0),
      precoUnitario: Number(item.precoUnitario ?? (item as Record<string, unknown>).preco_unit ?? 0),
      total: Number(item.total ?? 0),
    })),
  };
}

function normalizeCliente(cliente: Cliente) {
  const source = cliente as Cliente & Record<string, unknown>;

  return {
    ...cliente,
    id: cliente.id != null ? cliente.id : String(source.id_cliente ?? ''),
    nome: cliente.nome ?? String(source.nome ?? ''),
    telefone: cliente.telefone ?? String(source.telefone ?? ''),
    endereco: cliente.endereco ?? String(source.endereco ?? ''),
    observacoes: cliente.observacoes ?? String(source.obs ?? source.observacoes ?? ''),
    cnpj: cliente.cnpj ?? String(source.cnpj ?? ''),
    status: cliente.status ?? String(source.status ?? ''),
  };
}

function normalizeOrdemServico(os: OrdemServico) {
  const source = os as OrdemServico & Record<string, unknown>;

  return {
    ...os,
    id: os.id != null ? String(os.id) : String(source.id_os ?? ''),
    dataAbertura: os.dataAbertura ?? String(source.data ?? ''),
    clienteId: String(os.clienteId ?? source.cliente_id ?? ''),
    clienteNome: os.clienteNome ?? String(source.clienteNome ?? ''),
    status: os.status ?? String(source.status ?? 'Aberto'),
    descricao: os.descricao ?? String(source.descricao ?? ''),
    total: Number(os.total ?? source.total ?? 0),
    itensQuantidade: Number(os.itensQuantidade ?? source.itensQuantidade ?? 0),
  };
}

function normalizeProposalFile(file: ProposalFile) {
  const source = file as ProposalFile & Record<string, unknown>;

  return {
    id: String(file.id ?? source.fileId ?? source.id ?? ''),
    name: String(file.name ?? source.nome ?? 'Arquivo'),
    url: String(file.url ?? source.link ?? ''),
    createdAt: String(file.createdAt ?? source.createdAt ?? source.dataCriacao ?? ''),
    updatedAt: String(file.updatedAt ?? source.updatedAt ?? source.dataAtualizacao ?? ''),
    sizeBytes: Number(file.sizeBytes ?? source.sizeBytes ?? source.tamanho ?? 0),
  };
}

function normalizeStockItem(item: StockItem) {
  const source = item as StockItem & Record<string, unknown>;

  return {
    id: String(item.id ?? source.id_item_estoque ?? ''),
    nome: String(item.nome ?? source.nome ?? ''),
    categoria: String(item.categoria ?? source.categoria ?? ''),
    unidade: String(item.unidade ?? source.unidade ?? 'un'),
    quantidadeAtual: Number(item.quantidadeAtual ?? source.quantidade_atual ?? 0),
    custoUnitario: Number(item.custoUnitario ?? source.custo_unitario ?? 0),
    localizacao: String(item.localizacao ?? source.localizacao ?? ''),
    status: String(item.status ?? source.status ?? ''),
  };
}
