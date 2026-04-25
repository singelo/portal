export type ApiSuccess<T> = {
  ok: true;
  data: T;
  error?: never;
};

export type ApiFailure = {
  ok: false;
  data?: unknown;
  error?: {
    message?: string;
    code?: string;
  };
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export type SessionPayload = {
  token?: string;
  expiresAt?: string | number;
  user?: {
    name?: string;
    role?: string;
  };
};

export type DashboardSummary = {
  clientes?: number;
  osAbertas?: number;
  propostasPendentes?: number;
  status?: string;
  faturamentoMes?: number;
  agendaHoje?: number;
};

export type Cliente = {
  id?: string | number;
  nome?: string;
  telefone?: string;
  endereco?: string;
  observacoes?: string;
  cnpj?: string;
  status?: string;
  cidade?: string;
  responsavel?: string;
};

export type ClienteInput = {
  nome: string;
  telefone: string;
  endereco?: string;
  observacoes?: string;
  cnpj?: string;
  status?: string;
};

export type OrdemServicoStatus =
  | 'Aberto'
  | 'Em andamento'
  | 'Finalizado'
  | 'Cancelado'
  | 'Aguardando pagamento';

export type OrdemServico = {
  id: string;
  dataAbertura?: string;
  clienteId: string;
  clienteNome?: string;
  status: OrdemServicoStatus | string;
  descricao: string;
  total?: number;
  itensQuantidade?: number;
};

export type OrdemServicoInput = {
  clienteId: string;
  descricao: string;
};

export type OrdemServicoItemTipo = 'Produto' | 'Servico';

export type OrdemServicoItem = {
  id: string | number;
  osId: string;
  tipo: OrdemServicoItemTipo | string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
};

export type OrdemServicoItemInput = {
  osId: string;
  tipo: OrdemServicoItemTipo;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
};

export type OrdemServicoDetails = {
  os: OrdemServico;
  itens: OrdemServicoItem[];
};

export type PropostaInput = {
  clienteId: string;
  valor: string;
  prazo: string;
};

export type PdfPayload = {
  url: string;
};
