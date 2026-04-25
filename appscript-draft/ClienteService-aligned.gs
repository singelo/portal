function listClientes_() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'clientes:list:v2';
  const cached = cache.get(cacheKey);

  if (cached) {
    return parseJsonSafe_(cached, []);
  }

  const data = getRowsObject_(CONFIG.SHEETS.CLIENTES).map(function (cliente) {
    return normalizeClienteRecord_(cliente);
  });

  cache.put(cacheKey, JSON.stringify(data), 60);
  return data;
}

function createCliente_(payload) {
  if (!payload || !payload.nome) {
    throw new Error('Nome e obrigatorio.');
  }

  const cliente = {
    id_cliente: String(Date.now()),
    nome: String(payload.nome || '').trim(),
    telefone: String(payload.telefone || '').trim(),
    endereco: String(payload.endereco || '').trim(),
    obs: String(payload.observacoes || payload.obs || '').trim(),
    cnpj: String(payload.cnpj || '').trim(),
    status: String(payload.status || 'Ativo').trim(),
  };

  appendObject_(CONFIG.SHEETS.CLIENTES, cliente);
  clearClienteCaches_();

  return normalizeClienteRecord_(cliente);
}

function normalizeClienteRecord_(cliente) {
  return {
    id: String(cliente.id_cliente || ''),
    id_cliente: String(cliente.id_cliente || ''),
    nome: String(cliente.nome || ''),
    telefone: String(cliente.telefone || ''),
    endereco: String(cliente.endereco || ''),
    observacoes: String(cliente.obs || ''),
    obs: String(cliente.obs || ''),
    cnpj: String(cliente.cnpj || ''),
    status: String(cliente.status || 'Ativo'),
  };
}

function clearClienteCaches_() {
  const cache = CacheService.getScriptCache();
  cache.remove('clientes:list:v2');
  cache.remove('dashboard:summary:v1');
}
