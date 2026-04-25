function listOrdensServico_() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'os:list:v1';
  const cached = cache.get(cacheKey);

  if (cached) {
    return parseJsonSafe_(cached, []);
  }

  const clientes = getRowsObject_(CONFIG.SHEETS.CLIENTES);
  const osList = getRowsObject_(CONFIG.SHEETS.OS);
  const itens = getRowsObject_(CONFIG.SHEETS.ITENS_OS);

  const clienteById = {};
  clientes.forEach(function (cliente) {
    clienteById[String(cliente.id_cliente || '')] = cliente;
  });

  const itemAggByOsId = {};
  itens.forEach(function (item) {
    const osId = String(item.os_id || '');
    if (!osId) return;

    const total = parseBrNumber_(item.total);

    if (!itemAggByOsId[osId]) {
      itemAggByOsId[osId] = { total: 0, itensQuantidade: 0 };
    }

    itemAggByOsId[osId].total += isNaN(total) ? 0 : total;
    itemAggByOsId[osId].itensQuantidade += 1;
  });

  const result = osList.map(function (os) {
    const id = String(os.id_os || '');
    const cliente = clienteById[String(os.cliente_id || '')] || null;
    const agg = itemAggByOsId[id] || { total: 0, itensQuantidade: 0 };

    return {
      id: id,
      dataAbertura: os.data || '',
      clienteId: String(os.cliente_id || ''),
      clienteNome: cliente ? String(cliente.nome || '') : '',
      status: String(os.status || 'Aberto'),
      descricao: String(os.descricao || ''),
      total: agg.total,
      itensQuantidade: agg.itensQuantidade,
    };
  });

  cache.put(cacheKey, JSON.stringify(result), 60);
  return result;
}

function getOrdemServicoDetails_(osId) {
  const id = String(osId || '').trim();
  if (!id) throw new Error('OS obrigatoria.');

  const osList = getRowsObject_(CONFIG.SHEETS.OS);
  const itens = getRowsObject_(CONFIG.SHEETS.ITENS_OS);
  const clientes = getRowsObject_(CONFIG.SHEETS.CLIENTES);

  const os = osList.find(function (item) {
    return String(item.id_os || '') === id;
  });

  if (!os) {
    throw new Error('OS nao encontrada.');
  }

  const cliente = clientes.find(function (item) {
    return String(item.id_cliente || '') === String(os.cliente_id || '');
  });

  const itensOs = itens
    .filter(function (item) {
      return String(item.os_id || '') === id;
    })
    .map(function (item) {
      return normalizeOsItem_(item);
    });

  const total = itensOs.reduce(function (sum, item) {
    return sum + Number(item.total || 0);
  }, 0);

  return {
    os: {
      id: id,
      dataAbertura: os.data || '',
      clienteId: String(os.cliente_id || ''),
      clienteNome: cliente ? String(cliente.nome || '') : '',
      status: String(os.status || 'Aberto'),
      descricao: String(os.descricao || ''),
      total: total,
      itensQuantidade: itensOs.length,
    },
    itens: itensOs,
  };
}

function createOrdemServico_(payload) {
  if (!payload || !payload.clienteId) {
    throw new Error('Cliente obrigatorio.');
  }

  if (!payload.descricao) {
    throw new Error('Descricao obrigatoria.');
  }

  const nowDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
  const id = getNextSequenceId_(CONFIG.SHEETS.OS, 'id_os', 'SEQ_OS', 4);

  const os = {
    id_os: id,
    data: nowDate,
    cliente_id: String(payload.clienteId).trim(),
    status: 'Aberto',
    descricao: String(payload.descricao).trim(),
  };

  appendObject_(CONFIG.SHEETS.OS, os);
  clearOsCaches_();

  return getOrdemServicoDetails_(id).os;
}

function updateOrdemServico_(payload) {
  if (!payload || !payload.osId) {
    throw new Error('OS obrigatoria.');
  }

  if (!payload.clienteId) {
    throw new Error('Cliente obrigatorio.');
  }

  if (!payload.descricao) {
    throw new Error('Descricao obrigatoria.');
  }

  const current = getRowsObject_(CONFIG.SHEETS.OS).find(function (item) {
    return String(item.id_os || '') === String(payload.osId);
  });

  if (!current) {
    throw new Error('OS nao encontrada.');
  }

  const updated = {
    id_os: String(current.id_os || ''),
    data: String(current.data || ''),
    cliente_id: String(payload.clienteId || '').trim(),
    status: String(current.status || 'Aberto'),
    descricao: String(payload.descricao || '').trim(),
  };

  updateObjectById_(CONFIG.SHEETS.OS, payload.osId, 'id_os', updated);
  clearOsCaches_();

  return getOrdemServicoDetails_(payload.osId).os;
}

function deleteOrdemServico_(payload) {
  if (!payload || !payload.osId) {
    throw new Error('OS obrigatoria.');
  }

  const osId = String(payload.osId || '').trim();
  const itens = getRowsObject_(CONFIG.SHEETS.ITENS_OS).filter(function (item) {
    return String(item.os_id || '') === osId;
  });

  itens.forEach(function (item) {
    deleteRowById_(CONFIG.SHEETS.ITENS_OS, item.id_item, 'id_item');
  });

  deleteRowById_(CONFIG.SHEETS.OS, osId, 'id_os');
  clearOsCaches_();

  return { success: true };
}

function updateOrdemServicoStatus_(payload) {
  if (!payload || !payload.osId) {
    throw new Error('OS obrigatoria.');
  }

  if (!payload.status) {
    throw new Error('Status obrigatorio.');
  }

  const details = getOrdemServicoDetails_(payload.osId);
  const os = details.os;

  const updated = {
    id_os: os.id,
    data: os.dataAbertura,
    cliente_id: os.clienteId,
    status: String(payload.status).trim(),
    descricao: os.descricao,
  };

  updateObjectById_(CONFIG.SHEETS.OS, os.id, 'id_os', updated);
  clearOsCaches_();

  return getOrdemServicoDetails_(os.id).os;
}

function createOsItem_(payload) {
  validateOsItemPayload_(payload);

  const quantidade = parseBrNumber_(payload.quantidade);
  const precoUnitario = parseBrNumber_(payload.precoUnitario);

  const item = {
    id_item: getNextSequenceId_(CONFIG.SHEETS.ITENS_OS, 'id_item', 'SEQ_ITEM_OS', 4),
    os_id: String(payload.osId).trim(),
    estoque_item_id: String(payload.estoqueItemId || '').trim(),
    tipo: String(payload.tipo).trim(),
    descricao: String(payload.descricao).trim(),
    quantidade: quantidade,
    preco_unit: precoUnitario,
    total: quantidade * precoUnitario,
  };

  appendObject_(CONFIG.SHEETS.ITENS_OS, item);
  clearOsCaches_();

  return normalizeOsItem_(item);
}

function updateOsItem_(payload) {
  validateOsItemPayload_(payload);

  if (!payload.itemId) {
    throw new Error('Item obrigatorio.');
  }

  const current = getRowsObject_(CONFIG.SHEETS.ITENS_OS).find(function (item) {
    return String(item.id_item || '') === String(payload.itemId);
  });

  if (!current) {
    throw new Error('Item da OS nao encontrado.');
  }

  const quantidade = parseBrNumber_(payload.quantidade);
  const precoUnitario = parseBrNumber_(payload.precoUnitario);

  const updated = {
    id_item: String(current.id_item),
    os_id: String(payload.osId).trim(),
    estoque_item_id: String(payload.estoqueItemId || current.estoque_item_id || '').trim(),
    tipo: String(payload.tipo).trim(),
    descricao: String(payload.descricao).trim(),
    quantidade: quantidade,
    preco_unit: precoUnitario,
    total: quantidade * precoUnitario,
  };

  updateObjectById_(CONFIG.SHEETS.ITENS_OS, payload.itemId, 'id_item', updated);
  clearOsCaches_();

  return normalizeOsItem_(updated);
}

function deleteOsItem_(payload) {
  if (!payload || !payload.itemId) {
    throw new Error('Item obrigatorio.');
  }

  deleteRowById_(CONFIG.SHEETS.ITENS_OS, payload.itemId, 'id_item');
  clearOsCaches_();

  return { success: true };
}

function clearOsCaches_() {
  const cache = CacheService.getScriptCache();
  cache.remove('os:list:v1');
  cache.remove('dashboard:summary:v2');
}

function validateOsItemPayload_(payload) {
  if (!payload || !payload.osId) {
    throw new Error('OS obrigatoria.');
  }

  if (!payload.tipo) {
    throw new Error('Tipo obrigatorio.');
  }

  if (!payload.descricao) {
    throw new Error('Descricao obrigatoria.');
  }
}

function normalizeOsItem_(item) {
  return {
    id: normalizeSequenceText_(item.id_item),
    osId: String(item.os_id || ''),
    estoqueItemId: normalizeSequenceText_(item.estoque_item_id),
    tipo: String(item.tipo || ''),
    descricao: String(item.descricao || ''),
    quantidade: parseBrNumber_(item.quantidade),
    precoUnitario: parseBrNumber_(item.preco_unit),
    total: parseBrNumber_(item.total),
  };
}

function parseBrNumber_(value) {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }

  const normalized = String(value || '')
    .replace(/\s/g, '')
    .replace(/R\$/gi, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = Number(normalized);
  return isNaN(parsed) ? 0 : parsed;
}
