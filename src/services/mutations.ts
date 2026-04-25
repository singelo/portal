import { apiRequest } from './api';
import type {
  Cliente,
  ClienteInput,
  OrdemServico,
  OrdemServicoInput,
  OrdemServicoItem,
  OrdemServicoItemInput,
  PdfPayload,
  PropostaInput,
  StockItem,
  StockItemInput,
} from '../types/api';

export async function createCliente(payload: ClienteInput): Promise<Cliente> {
  const result = await apiRequest('clientes.create', { payload });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao criar cliente.');
  }

  return normalizeCliente(result.data);
}

export async function updateCliente(clienteId: string | number, payload: ClienteInput): Promise<Cliente> {
  const result = await apiRequest('clientes.update', { payload: { clienteId, ...payload } });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao atualizar cliente.');
  }

  return normalizeCliente(result.data);
}

export async function deleteCliente(clienteId: string | number): Promise<void> {
  const result = await apiRequest('clientes.delete', { payload: { clienteId } });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao excluir cliente.');
  }
}

export async function createOrdemServico(payload: OrdemServicoInput): Promise<OrdemServico> {
  const result = await apiRequest('os.create', { payload });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao criar ordem de servico.');
  }

  return result.data;
}

export async function updateOrdemServico(osId: string, payload: OrdemServicoInput): Promise<OrdemServico> {
  const result = await apiRequest('os.update', { payload: { osId, ...payload } });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao atualizar ordem de servico.');
  }

  return result.data;
}

export async function deleteOrdemServico(osId: string): Promise<void> {
  const result = await apiRequest('os.delete', { payload: { osId } });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao excluir ordem de servico.');
  }
}

export async function updateOrdemServicoStatus(osId: string, status: string): Promise<OrdemServico> {
  const result = await apiRequest('os.status.update', { payload: { osId, status } });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao atualizar o status da OS.');
  }

  return result.data;
}

export async function createOrdemServicoItem(payload: OrdemServicoItemInput): Promise<OrdemServicoItem> {
  const result = await apiRequest('os.items.create', { payload });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao adicionar item na OS.');
  }

  return result.data;
}

export async function updateOrdemServicoItem(
  itemId: string | number,
  payload: OrdemServicoItemInput,
): Promise<OrdemServicoItem> {
  const result = await apiRequest('os.items.update', { payload: { itemId, ...payload } });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao atualizar item da OS.');
  }

  return result.data;
}

export async function deleteOrdemServicoItem(itemId: string | number): Promise<void> {
  const result = await apiRequest('os.items.delete', { payload: { itemId } });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao excluir item da OS.');
  }
}

export async function generateOrdemServicoPdf(osId: string): Promise<string> {
  const result = await apiRequest('os.pdf', { osId });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao gerar PDF da OS.');
  }

  return normalizePdfUrl(result.data);
}

export async function generatePropostaPdf(payload: PropostaInput): Promise<string> {
  const result = await apiRequest('propostas.generate', { payload });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao gerar proposta.');
  }

  return normalizePdfUrl(result.data);
}

export async function createStockItem(payload: StockItemInput): Promise<StockItem> {
  const result = await apiRequest('estoque.create', { payload });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao cadastrar item de estoque.');
  }

  return normalizeStockItem(result.data);
}

export async function deleteStockItem(itemId: string): Promise<void> {
  const result = await apiRequest('estoque.delete', { payload: { itemId } });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao excluir item de estoque.');
  }
}

function normalizePdfUrl(payload: PdfPayload | string) {
  if (typeof payload === 'string') {
    return payload;
  }

  if (payload?.url) {
    return payload.url;
  }

  throw new Error('A API nao retornou a URL do PDF.');
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
