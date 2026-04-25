# Fluxo de Estoque x OS

## Estrutura recomendada

Na aba `ItensOS`, adicione estas colunas:

- `estoque_item_id`
- `estoque_qtd_reservada`
- `estoque_qtd_baixada`

## Regra de negocio

### OS em aberto / em andamento / aguardando pagamento
- nao baixa do estoque ainda
- apenas reserva a quantidade

### OS finalizada
- baixa do estoque a quantidade reservada
- marca `estoque_qtd_baixada`

### OS cancelada
- zera a reserva
- nao baixa nada

### OS que volta de finalizada para outro status
- desfaz a baixa
- volta a reserva

## Vantagem

- voce enxerga o que ainda pode ser usado em outra OS
- evita baixar material antes da hora
- permite corrigir erro de status sem perder saldo
- deixa historico claro por item
