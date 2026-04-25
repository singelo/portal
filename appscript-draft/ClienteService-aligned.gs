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
    id_cliente: getNextSequenceId_(CONFIG.SHEETS.CLIENTES, 'id_cliente', 'SEQ_CLIENTE', 4),
    nome: String(payload.nome || '').trim(),
    telefone: String(payload.telefone || '').trim(),
    endereco: String(payload.endereco || '').trim(),
    obs: String(payload.observacoes || payload.obs || '').trim(),
    cnpj: String(payload.cnpj || '').trim(),
    status: normalizeClienteStatus_(payload.status),
  };

  appendObject_(CONFIG.SHEETS.CLIENTES, cliente);
  clearClienteCaches_();

  return normalizeClienteRecord_(cliente);
}

function updateCliente_(payload) {
  if (!payload || !payload.clienteId) {
    throw new Error('Cliente obrigatorio.');
  }

  if (!payload.nome) {
    throw new Error('Nome e obrigatorio.');
  }

  const current = getRowsObject_(CONFIG.SHEETS.CLIENTES).find(function (cliente) {
    return String(cliente.id_cliente || '') === String(payload.clienteId);
  });

  if (!current) {
    throw new Error('Cliente nao encontrado.');
  }

  const updated = {
    id_cliente: String(current.id_cliente || ''),
    nome: String(payload.nome || '').trim(),
    telefone: String(payload.telefone || '').trim(),
    endereco: String(payload.endereco || '').trim(),
    obs: String(payload.observacoes || payload.obs || '').trim(),
    cnpj: String(payload.cnpj || '').trim(),
    status: normalizeClienteStatus_(payload.status || current.status),
  };

  updateObjectById_(CONFIG.SHEETS.CLIENTES, payload.clienteId, 'id_cliente', updated);
  clearClienteCaches_();

  return normalizeClienteRecord_(updated);
}

function deleteCliente_(payload) {
  if (!payload || !payload.clienteId) {
    throw new Error('Cliente obrigatorio.');
  }

  const clienteId = String(payload.clienteId || '').trim();
  const hasOs = getRowsObject_(CONFIG.SHEETS.OS).some(function (os) {
    return String(os.cliente_id || '') === clienteId;
  });

  if (hasOs) {
    throw new Error('Este cliente ja possui OS vinculada. Exclua ou altere as OS antes de remover o cadastro.');
  }

  deleteRowById_(CONFIG.SHEETS.CLIENTES, clienteId, 'id_cliente');
  clearClienteCaches_();

  return { success: true };
}

function normalizeClienteRecord_(cliente) {
  return {
    id: normalizeSequenceText_(cliente.id_cliente),
    id_cliente: normalizeSequenceText_(cliente.id_cliente),
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
  cache.remove('dashboard:summary:v2');
}

function normalizeClienteStatus_(status) {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'inativo') return 'Inativo';
  return 'Ativo';
}
