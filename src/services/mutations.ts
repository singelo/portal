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
} from '../types/api';

export async function createCliente(payload: ClienteInput): Promise<Cliente> {
  const result = await apiRequest('clientes.create', { payload });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao criar cliente.');
  }

  return normalizeCliente(result.data);
}

export async function createOrdemServico(payload: OrdemServicoInput): Promise<OrdemServico> {
  const result = await apiRequest('os.create', { payload });
  if (!result.ok) {
    throw new Error(result.error?.message || 'Erro ao criar ordem de servico.');
  }

  return result.data;
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
