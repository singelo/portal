/*
Adicionar estes casos dentro de handleRequest_(e, method), no switch(action):

case 'clientes.update':
  requireSession_(params.token);
  return ok_(updateCliente_(params.payload));

case 'clientes.delete':
  requireSession_(params.token);
  return ok_(deleteCliente_(params.payload));

case 'os.list':
  requireSession_(params.token);
  return ok_(listOrdensServico_());

case 'os.details':
  requireSession_(params.token);
  return ok_(getOrdemServicoDetails_(params.osId));

case 'os.create':
  requireSession_(params.token);
  return ok_(createOrdemServico_(params.payload));

case 'os.update':
  requireSession_(params.token);
  return ok_(updateOrdemServico_(params.payload));

case 'os.delete':
  requireSession_(params.token);
  return ok_(deleteOrdemServico_(params.payload));

case 'os.status.update':
  requireSession_(params.token);
  return ok_(updateOrdemServicoStatus_(params.payload));

case 'os.items.create':
  requireSession_(params.token);
  return ok_(createOsItem_(params.payload));

case 'os.items.update':
  requireSession_(params.token);
  return ok_(updateOsItem_(params.payload));

case 'os.items.delete':
  requireSession_(params.token);
  return ok_(deleteOsItem_(params.payload));

case 'os.pdf':
  requireSession_(params.token);
  return ok_(generateOrdemServicoPdf_(params.osId));

case 'propostas.generate':
  requireSession_(params.token);
  return ok_(generateProposta_(params.payload));

case 'propostas.list':
  requireSession_(params.token);
  return ok_(listProposalFiles_());

case 'estoque.list':
  requireSession_(params.token);
  return ok_(listEstoque_());

case 'estoque.create':
  requireSession_(params.token);
  return ok_(createEstoqueItem_(params.payload));

case 'estoque.delete':
  requireSession_(params.token);
  return ok_(deleteEstoqueItem_(params.payload));
*/
