import { useEffect, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/button';
import { Dialog, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { createCliente, createOrdemServico, createOrdemServicoItem, generatePropostaPdf, updateOrdemServicoItem, updateOrdemServicoStatus } from '../../services/mutations';
import { fetchClientes, queryKeys } from '../../services/queries';
import type { OrdemServicoItem, OrdemServicoStatus } from '../../types/api';

const clienteSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome do cliente.'),
  telefone: z.string().trim().min(1, 'Informe o telefone.'),
  endereco: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
  cnpj: z.string().trim().optional(),
});

const ordemServicoSchema = z.object({
  clienteId: z.string().trim().min(1, 'Selecione um cliente.'),
  descricao: z.string().trim().min(1, 'Descreva a ordem de servico.'),
});

const propostaSchema = z.object({
  clienteId: z.string().trim().min(1, 'Selecione um cliente.'),
  valor: z.string().trim().min(1, 'Informe o valor da proposta.'),
  prazo: z.string().trim().min(1, 'Selecione o prazo.'),
});

const osItemSchema = z.object({
  tipo: z.enum(['Produto', 'Servico']),
  descricao: z.string().trim().min(1, 'Descreva o item.'),
  quantidade: z.string().trim().min(1, 'Informe a quantidade.'),
  precoUnitario: z.string().trim().min(1, 'Informe o preco unitario.'),
});

const osStatusSchema = z.object({
  status: z.enum(['Aberto', 'Em andamento', 'Finalizado', 'Cancelado', 'Aguardando pagamento']),
});

type ClienteModalProps = {
  open: boolean;
  onClose: () => void;
};

type OrdemServicoModalProps = {
  open: boolean;
  onClose: () => void;
};

type PropostaModalProps = {
  open: boolean;
  onClose: () => void;
};

type OrdemServicoItemModalProps = {
  open: boolean;
  osId: string;
  item?: OrdemServicoItem | null;
  onClose: () => void;
};

type OrdemServicoStatusModalProps = {
  open: boolean;
  osId: string;
  initialStatus: OrdemServicoStatus | string;
  onClose: () => void;
};

export function ClienteModal({ open, onClose }: ClienteModalProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof clienteSchema>>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: '',
      telefone: '',
      endereco: '',
      observacoes: '',
      cnpj: '',
    },
  });

  const mutation = useMutation({
    mutationFn: createCliente,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.clientes }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary }),
      ]);
      form.reset();
      onClose();
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [form, open]);

  return (
    <Dialog
      onClose={onClose}
      open={open}
      title="Novo cliente"
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          await mutation.mutateAsync(values);
        })}
      >
        <FormField error={form.formState.errors.nome?.message} label="Nome">
          <Input placeholder="Nome do cliente" {...form.register('nome')} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField error={form.formState.errors.telefone?.message} label="Telefone">
            <Controller
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <Input
                  inputMode="tel"
                  placeholder="(00) 00000-0000"
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(maskPhone(event.target.value))}
                />
              )}
            />
          </FormField>

          <FormField error={form.formState.errors.cnpj?.message} label="CNPJ">
            <Controller
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <Input
                  inputMode="numeric"
                  placeholder="00.000.000/0000-00"
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(maskCnpj(event.target.value))}
                />
              )}
            />
          </FormField>
        </div>

        <FormField error={form.formState.errors.endereco?.message} label="Endereco">
          <Input placeholder="Endereco ou referencia" {...form.register('endereco')} />
        </FormField>

        <FormField error={form.formState.errors.observacoes?.message} label="Observacoes">
          <Textarea placeholder="Detalhes importantes para atendimento, acesso ou financeiro." {...form.register('observacoes')} />
        </FormField>

        {mutation.error ? <ErrorMessage message={(mutation.error as Error).message} /> : null}

        <DialogFooter>
          <Button onClick={onClose} type="button" variant="outline">
            Cancelar
          </Button>
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? 'Salvando...' : 'Salvar cliente'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

export function OrdemServicoModal({ open, onClose }: OrdemServicoModalProps) {
  const queryClient = useQueryClient();
  const clientesQuery = useQuery({
    enabled: open,
    queryKey: queryKeys.clientes,
    queryFn: fetchClientes,
    staleTime: 5 * 60_000,
  });

  const form = useForm<z.infer<typeof ordemServicoSchema>>({
    resolver: zodResolver(ordemServicoSchema),
    defaultValues: {
      clienteId: '',
      descricao: '',
    },
  });

  const mutation = useMutation({
    mutationFn: createOrdemServico,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.ordensServico }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary }),
      ]);
      form.reset();
      onClose();
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [form, open]);

  return (
    <Dialog
      onClose={onClose}
      open={open}
      title="Nova ordem de servico"
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          await mutation.mutateAsync(values);
        })}
      >
        <FormField error={form.formState.errors.clienteId?.message} label="Cliente">
          <Select {...form.register('clienteId')}>
            <option value="">Selecione um cliente</option>
            {(clientesQuery.data ?? []).map((cliente, index) => (
              <option key={String(cliente.id ?? `cliente-${index}`)} value={String(cliente.id ?? '')}>
                {cliente.nome}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField error={form.formState.errors.descricao?.message} label="Descricao da OS">
          <Textarea placeholder="Descreva o escopo inicial da ordem de servico." {...form.register('descricao')} />
        </FormField>

        {clientesQuery.isError ? <ErrorMessage message={(clientesQuery.error as Error).message} /> : null}
        {mutation.error ? <ErrorMessage message={(mutation.error as Error).message} /> : null}

        <DialogFooter>
          <Button onClick={onClose} type="button" variant="outline">
            Cancelar
          </Button>
          <Button disabled={mutation.isPending || clientesQuery.isLoading} type="submit">
            {mutation.isPending ? 'Salvando...' : 'Criar OS'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

export function PropostaModal({ open, onClose }: PropostaModalProps) {
  const clientesQuery = useQuery({
    enabled: open,
    queryKey: queryKeys.clientes,
    queryFn: fetchClientes,
    staleTime: 5 * 60_000,
  });

  const form = useForm<z.infer<typeof propostaSchema>>({
    resolver: zodResolver(propostaSchema),
    defaultValues: {
      clienteId: '',
      valor: '',
      prazo: '24',
    },
  });

  const mutation = useMutation({
    mutationFn: generatePropostaPdf,
    onSuccess: (url) => {
      window.open(url, '_blank', 'noopener,noreferrer');
      form.reset({
        clienteId: '',
        valor: '',
        prazo: '24',
      });
      onClose();
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        clienteId: '',
        valor: '',
        prazo: '24',
      });
    }
  }, [form, open]);

  return (
    <Dialog
      onClose={onClose}
      open={open}
      title="Gerar proposta"
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          await mutation.mutateAsync(values);
        })}
      >
        <FormField error={form.formState.errors.clienteId?.message} label="Cliente">
          <Select {...form.register('clienteId')}>
            <option value="">Selecione um cliente</option>
            {(clientesQuery.data ?? []).map((cliente, index) => (
              <option key={String(cliente.id ?? `cliente-${index}`)} value={String(cliente.id ?? '')}>
                {cliente.nome}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField error={form.formState.errors.valor?.message} label="Valor">
            <Controller
              control={form.control}
              name="valor"
              render={({ field }) => (
                <Input
                  inputMode="decimal"
                  placeholder="550,00"
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(maskCurrency(event.target.value))}
                />
              )}
            />
          </FormField>

          <FormField error={form.formState.errors.prazo?.message} label="Prazo">
            <Select {...form.register('prazo')}>
              <option value="24">24 horas</option>
              <option value="72">72 horas</option>
            </Select>
          </FormField>
        </div>

        {clientesQuery.isError ? <ErrorMessage message={(clientesQuery.error as Error).message} /> : null}
        {mutation.error ? <ErrorMessage message={(mutation.error as Error).message} /> : null}

        <DialogFooter>
          <Button onClick={onClose} type="button" variant="outline">
            Cancelar
          </Button>
          <Button disabled={mutation.isPending || clientesQuery.isLoading} type="submit">
            {mutation.isPending ? 'Gerando...' : 'Gerar PDF'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

export function OrdemServicoItemModal({ open, osId, item, onClose }: OrdemServicoItemModalProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof osItemSchema>>({
    resolver: zodResolver(osItemSchema),
    defaultValues: getItemDefaultValues(item),
  });

  useEffect(() => {
    if (open) {
      form.reset(getItemDefaultValues(item));
    }
  }, [form, item, open]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof osItemSchema>) => {
      const payload = {
        osId,
        tipo: values.tipo,
        descricao: values.descricao,
        quantidade: Number(values.quantidade),
        precoUnitario: parseCurrency(values.precoUnitario),
      } as const;

      if (item) {
        return updateOrdemServicoItem(item.id, payload);
      }

      return createOrdemServicoItem(payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.ordensServico }),
        queryClient.invalidateQueries({ queryKey: queryKeys.ordemServicoDetails(osId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary }),
      ]);
      onClose();
    },
  });

  return (
    <Dialog
      onClose={onClose}
      open={open}
      title={item ? 'Editar item da OS' : 'Novo item da OS'}
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          await mutation.mutateAsync(values);
        })}
      >
        <FormField error={form.formState.errors.tipo?.message} label="Tipo">
          <Select {...form.register('tipo')}>
            <option value="Produto">Produto</option>
            <option value="Servico">Servico</option>
          </Select>
        </FormField>

        <FormField error={form.formState.errors.descricao?.message} label="Descricao">
          <Input placeholder="Descricao do item" {...form.register('descricao')} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField error={form.formState.errors.quantidade?.message} label="Quantidade">
            <Controller
              control={form.control}
              name="quantidade"
              render={({ field }) => (
                <Input
                  inputMode="numeric"
                  placeholder="1"
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(maskInteger(event.target.value, 99))}
                />
              )}
            />
          </FormField>

          <FormField error={form.formState.errors.precoUnitario?.message} label="Preco unitario">
            <Controller
              control={form.control}
              name="precoUnitario"
              render={({ field }) => (
                <Input
                  inputMode="decimal"
                  placeholder="250,00"
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(maskCurrency(event.target.value))}
                />
              )}
            />
          </FormField>
        </div>

        {mutation.error ? <ErrorMessage message={(mutation.error as Error).message} /> : null}

        <DialogFooter>
          <Button onClick={onClose} type="button" variant="outline">
            Cancelar
          </Button>
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? 'Salvando...' : item ? 'Salvar item' : 'Adicionar item'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

export function OrdemServicoStatusModal({ open, osId, initialStatus, onClose }: OrdemServicoStatusModalProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof osStatusSchema>>({
    resolver: zodResolver(osStatusSchema),
    defaultValues: {
      status: normalizeStatus(initialStatus),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ status: normalizeStatus(initialStatus) });
    }
  }, [form, initialStatus, open]);

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof osStatusSchema>) => updateOrdemServicoStatus(osId, values.status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.ordensServico }),
        queryClient.invalidateQueries({ queryKey: queryKeys.ordemServicoDetails(osId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary }),
      ]);
      onClose();
    },
  });

  return (
    <Dialog
      onClose={onClose}
      open={open}
      title="Atualizar status da OS"
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          await mutation.mutateAsync(values);
        })}
      >
        <FormField error={form.formState.errors.status?.message} label="Status">
          <Select {...form.register('status')}>
            <option value="Aberto">Aberto</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Cancelado">Cancelado</option>
            <option value="Aguardando pagamento">Aguardando pagamento</option>
          </Select>
        </FormField>

        {mutation.error ? <ErrorMessage message={(mutation.error as Error).message} /> : null}

        <DialogFooter>
          <Button onClick={onClose} type="button" variant="outline">
            Cancelar
          </Button>
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? 'Atualizando...' : 'Salvar status'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </label>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return <div className="rounded-2xl border border-danger/15 bg-danger/10 px-4 py-3 text-sm text-danger">{message}</div>;
}

function parseCurrency(value: string) {
  const normalized = value.replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
}

function formatCurrencyInput(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return '';
  }

  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getItemDefaultValues(item?: OrdemServicoItem | null): z.infer<typeof osItemSchema> {
  if (!item) {
    return {
      tipo: 'Produto',
      descricao: '',
      quantidade: '1',
      precoUnitario: '',
    };
  }

  return {
    tipo: item.tipo === 'Servico' ? 'Servico' : 'Produto',
    descricao: item.descricao,
    quantidade: String(item.quantidade ?? 1),
    precoUnitario: formatCurrencyInput(item.precoUnitario),
  };
}

function normalizeStatus(status: OrdemServicoStatus | string): z.infer<typeof osStatusSchema>['status'] {
  if (status === 'Em andamento' || status === 'Finalizado' || status === 'Cancelado' || status === 'Aguardando pagamento') {
    return status;
  }

  return 'Aberto';
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return digits.replace(/(\d{2})(\d+)/, '($1) $2');
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');

  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

function maskCnpj(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 14);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return digits.replace(/(\d{2})(\d+)/, '$1.$2');
  if (digits.length <= 8) return digits.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
  if (digits.length <= 12) return digits.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');

  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function maskInteger(value: string, max: number) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  const parsed = Math.min(Number(digits), max);
  return String(parsed);
}

function maskCurrency(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  const numeric = Number(digits) / 100;
  return numeric.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
