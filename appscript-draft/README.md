# App Script Draft

Arquivos prontos para copiar para o seu projeto do Google Apps Script.

## O que entra novo

- `ClienteService-aligned.gs`
- `SheetMutations.gs`
- `OsService.gs`
- `PdfService.gs`
- `PropostaService.gs`
- `EstoqueService.gs`

## O que ajustar no projeto atual

1. Adicionar as chaves e nomes de aba de `Config-additions.gs`
2. Alinhar `ClienteService.gs` com `ClienteService-aligned.gs`
3. Colar os casos do `Router-additions.gs` dentro do `handleRequest_`
4. Criar os templates HTML:
   - `os_pdf_template.html`
   - `proposta_pdf_template.html`
5. Configurar as properties:
   - `PDF_FOLDER_ID`
   - `PDF_LOGO_FILE_ID`
   - opcionalmente limpar `SEQ_OS` e `SEQ_ITEM_OS` se quiser reiniciar a sequencia

## Estrutura real das abas

### Clientes

- `id_cliente`
- `nome`
- `telefone`
- `endereco`
- `obs`
- `cnpj`
- `status`

### OS

- `id_os`
- `data`
- `cliente_id`
- `status`
- `descricao`

### ItensOS

- `id_item`
- `os_id`
- `tipo`
- `descricao`
- `quantidade`
- `preco_unit`
- `total`

### Estoque

- `id_item_estoque`
- `nome`
- `categoria`
- `unidade`
- `quantidade_atual`
- `custo_unitario`
- `localizacao`
- `status`

## Estrategia para estoque

Modelo simples e profissional para comecar:

1. cadastro livre de item no estoque
2. item pode ser usado manualmente na OS
3. depois voce decide se quer debitar estoque automaticamente ao lancar item da OS

Minha recomendacao agora:

- fase 1: so listar e cadastrar estoque
- fase 2: permitir puxar item do estoque para OS
- fase 3: controlar baixa automatica e alertas de reposicao

## IDs em formato curto

Para manter `id_os` e `id_item` como `0001`, `0002`, `0060`:

1. Formate as colunas `id_os` e `id_item` da planilha como `Texto simples`
2. Ajuste os registros antigos para o padrao novo
3. Se ja existir property antiga de sequencia, apague:
   - `SEQ_OS`
   - `SEQ_ITEM_OS`

Na primeira criacao depois disso, o Apps Script le o maior valor atual da planilha e continua dali.

## Estrategia de PDF recomendada

### Melhor que base64

Nao retornar PDF em base64 pelo JSON.

Fluxo recomendado:

1. Apps Script monta HTML com `HtmlService`
2. converte para `Blob` PDF
3. salva no Drive em pasta propria
4. remove arquivo anterior com mesmo nome, se existir
5. retorna `{ url, fileId, name }`

### Por que isso e melhor

- payload menor na API
- menos stress no Worker e no frontend
- link pronto para abrir
- historico e rastreio de documento
- mais simples para proposta e OS reais

### Quando evitar Drive

Se o PDF fosse puramente temporario e sem qualquer valor de historico, daria para pensar em outra estrategia. Para OS e proposta, manter no Drive ainda faz sentido.
