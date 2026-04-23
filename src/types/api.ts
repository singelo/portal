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
  cnpj?: string;
  status?: string;
  cidade?: string;
  responsavel?: string;
};
