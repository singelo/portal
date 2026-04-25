# RM Portal

## Objetivo

Frontend em `React + TypeScript + Vite` para um painel interno ligado a um backend em `Apps Script`, exposto por um `Cloudflare Worker`.

## Estrutura do projeto

### `src/main.tsx`

Ponto de entrada do app.
Inicializa `React Query`, autenticacao e rotas.

### `src/router.tsx`

Define as rotas principais:

- `/login`
- `/`
- `/clientes`
- `/ordens-servico`
- fallback `404`

### `src/config/app.ts`

Constantes globais do projeto, como nome e descricao da aplicacao.

### `src/services/api.ts`

Camada base de HTTP.

Responsabilidades:

- envio de requests para o Worker
- leitura do token salvo
- instrumentacao de tempo de resposta
- historico de metricas para debug no navegador
- definicao central do mapa de acoes aceitas pelo frontend

### `src/services/auth.ts`

Camada de autenticacao.

Responsabilidades:

- login
- restauracao de sessao
- logout
- persistencia de token no `localStorage`

### `src/services/queries.ts`

Centraliza leituras reutilizaveis e chaves do `React Query`.

Hoje contem:

- `queryKeys`
- `fetchDashboardSummary`
- `fetchClientes`
- `fetchOrdensServico`
- `fetchOrdemServicoDetails`

### `src/services/mutations.ts`

Centraliza mutacoes e normalizacao de retorno para PDFs.

Hoje contem:

- `createCliente`
- `createOrdemServico`
- `updateOrdemServicoStatus`
- `createOrdemServicoItem`
- `updateOrdemServicoItem`
- `deleteOrdemServicoItem`
- `generateOrdemServicoPdf`
- `generatePropostaPdf`

### `src/stores/auth-store.tsx`

Contexto de autenticacao do frontend.

Responsabilidades:

- expor `status` autenticado ou anonimo
- executar `signIn`
- executar `signOut`
- validar sessao salva em background

### `src/shell/`

Estrutura do app autenticado.

- `app-shell-layout.tsx`: sidebar, header e conteudo principal
- `navigation.ts`: itens da navegacao lateral

### `src/pages/`

Paginas do sistema:

- `login-page.tsx`
- `dashboard-page.tsx`
- `clientes-page.tsx`
- `ordens-servico-page.tsx`
- `not-found-page.tsx`

### `src/features/operacao/`

Fluxos de negocio mais importantes do painel.

Hoje concentra:

- modal de novo cliente
- modal de nova OS
- modal de proposta
- modal de item da OS
- modal de status da OS

### `src/components/`

Componentes reutilizaveis de UI e composicao.

Hoje inclui componentes base como:

- `button`
- `card`
- `dialog`
- `input`
- `select`
- `table`
- `textarea`

### `src/lib/`

Helpers pequenos:

- `utils.ts`: combinacao de classes CSS
- `format.ts`: formatadores de telefone, documento e moeda

### `src/types/`

Tipos TypeScript compartilhados com a API.

## Scripts

### Desenvolvimento local

```powershell
npm.cmd run dev
```

### Desenvolvimento em rede local

```powershell
npm.cmd run dev:host
```

Usar para testar em celular ou em dispositivos da mesma rede.

### Verificacao de tipos

```powershell
npm.cmd run typecheck
```

### Build padrao

```powershell
npm.cmd run build
```

### Build para GitHub Pages

```powershell
npm.cmd run build:pages
```

Esse build ja considera a base `/portal/`.

### Preview do build

```powershell
npm.cmd run preview
```

## Debug de API

Ativar logs:

```js
localStorage.setItem('rm_debug_api', '1')
location.reload()
```

Ver historico:

```js
window.__RM_API_METRICS__
```

Desativar:

```js
localStorage.removeItem('rm_debug_api')
```

## Fluxos operacionais atuais

### Clientes

- listagem em `src/pages/clientes-page.tsx`
- criacao via modal em `src/features/operacao/action-modals.tsx`
- leitura: `clientes.list`
- escrita: `clientes.create`

### Ordens de servico

- listagem e detalhe em `src/pages/ordens-servico-page.tsx`
- criacao via modal
- atualizacao de status via modal
- gestao de itens via modal
- leitura: `os.list` e `os.details`
- escrita: `os.create`, `os.status.update`, `os.items.create`, `os.items.update`, `os.items.delete`

### Propostas

- geracao via modal
- leitura de clientes cadastrados
- escrita: `propostas.generate`
- resposta esperada: URL do PDF gerado

### PDFs

- PDF de OS: `os.pdf`
- PDF de proposta: `propostas.generate`
- o frontend aceita tanto retorno em string pura quanto objeto `{ url }`

## Contrato esperado do backend

Para o frontend atual funcionar por completo, o Worker ou Apps Script precisa responder estas acoes:

- `clientes.list`
- `clientes.create`
- `dashboard.summary`
- `os.list`
- `os.details`
- `os.create`
- `os.status.update`
- `os.items.create`
- `os.items.update`
- `os.items.delete`
- `os.pdf`
- `propostas.generate`

Se o backend ainda estiver no formato antigo (`addRow`, `updateRow`, `deleteRow`, `gerarPDF`, `gerarPropostaPDF`), o ideal e adaptar o router do Apps Script para esse contrato novo em vez de espalhar regras legadas no frontend.

## Deploy no GitHub Pages

URL de producao:

`https://singelo.github.io/portal/`

O projeto precisa ser publicado com a base `/portal/`, ja configurada em `vite.config.ts`.

Se o deploy for manual:

1. rodar `npm.cmd run build:pages`
2. publicar o conteudo gerado em `dist`

## Boas praticas de manutencao

- manter chamadas HTTP concentradas em `src/services`
- manter leituras compartilhadas em `src/services/queries.ts`
- manter escritas compartilhadas em `src/services/mutations.ts`
- invalidar cache via `queryKeys` quando alterar cliente, OS ou item
- evitar texto de teste, comentarios temporarios e residuos de template
