function getDashboardSummary_() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'dashboard:summary:v2';
  const cached = cache.get(cacheKey);

  if (cached) {
    return parseJsonSafe_(cached, {});
  }

  const clienteStatuses = getColumnValuesByHeader_(CONFIG.SHEETS.CLIENTES, 'status');
  const osRows = getRowsObject_(CONFIG.SHEETS.OS);
  const itensRows = getRowsObject_(CONFIG.SHEETS.ITENS_OS);

  const clientesAtivos = clienteStatuses.filter(function (status) {
    return String(status || '').trim().toLowerCase() !== 'inativo';
  }).length;

  const osAbertas = osRows.filter(function (os) {
    const status = String(os.status || '').trim().toLowerCase();
    return ['aberto', 'em andamento', 'pendente', 'aguardando pagamento'].includes(status);
  }).length;

  const osFinalizadasIds = {};
  osRows.forEach(function (os) {
    const status = String(os.status || '').trim().toLowerCase();
    if (status === 'finalizado') {
      osFinalizadasIds[String(os.id_os || '')] = true;
    }
  });

  const faturamentoGeral = itensRows.reduce(function (acc, item) {
    const osId = String(item.os_id || '');
    if (!osFinalizadasIds[osId]) {
      return acc;
    }

    return acc + parseBrNumber_(item.total);
  }, 0);

  const result = {
    clientes: clientesAtivos,
    osAbertas: osAbertas,
    faturamentoGeral: faturamentoGeral,
  };

  cache.put(cacheKey, JSON.stringify(result), 30);
  return result;
}

function clearDashboardCache_() {
  CacheService.getScriptCache().remove('dashboard:summary:v2');
}
