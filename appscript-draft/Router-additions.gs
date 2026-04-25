/*
Adicionar estes casos dentro de handleRequest_(e, method), no switch(action):

case 'os.list':
  requireSession_(params.token);
  return ok_(listOrdensServico_());

case 'os.details':
  requireSession_(params.token);
  return ok_(getOrdemServicoDetails_(params.osId));

case 'os.create':
  requireSession_(params.token);
  return ok_(createOrdemServico_(params.payload));

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
*/
