function listEstoque_() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'estoque:list:v1';
  const cached = cache.get(cacheKey);

  if (cached) {
    return parseJsonSafe_(cached, []);
  }

  const data = getRowsObject_(CONFIG.SHEETS.ESTOQUE).map(function (item) {
    return normalizeEstoqueItem_(item);
  });

  cache.put(cacheKey, JSON.stringify(data), 60);
  return data;
}

function createEstoqueItem_(payload) {
  if (!payload || !payload.nome) {
    throw new Error('Nome do item obrigatorio.');
  }

  const quantidade = parseBrNumber_(payload.quantidade);
  const custo = parseBrNumber_(payload.custoUnitario);

  const item = {
    id_item_estoque: getNextSequenceId_(CONFIG.SHEETS.ESTOQUE, 'id_item_estoque', 'SEQ_ESTOQUE', 4),
    nome: String(payload.nome || '').trim(),
    categoria: String(payload.categoria || '').trim(),
    unidade: String(payload.unidade || 'un').trim(),
    quantidade_atual: quantidade,
    custo_unitario: custo,
    localizacao: String(payload.localizacao || '').trim(),
    status: quantidade > 0 ? 'Disponivel' : 'Sem estoque',
  };

  appendObject_(CONFIG.SHEETS.ESTOQUE, item);
  clearEstoqueCaches_();

  return normalizeEstoqueItem_(item);
}

function deleteEstoqueItem_(payload) {
  if (!payload || !payload.itemId) {
    throw new Error('Item de estoque obrigatorio.');
  }

  deleteRowById_(CONFIG.SHEETS.ESTOQUE, payload.itemId, 'id_item_estoque');
  clearEstoqueCaches_();

  return { success: true };
}

function normalizeEstoqueItem_(item) {
  return {
    id: normalizeSequenceText_(item.id_item_estoque),
    nome: String(item.nome || ''),
    categoria: String(item.categoria || ''),
    unidade: String(item.unidade || 'un'),
    quantidadeAtual: parseBrNumber_(item.quantidade_atual),
    custoUnitario: parseBrNumber_(item.custo_unitario),
    localizacao: String(item.localizacao || ''),
    status: String(item.status || 'Disponivel'),
  };
}

function clearEstoqueCaches_() {
  const cache = CacheService.getScriptCache();
  cache.remove('estoque:list:v1');
}
