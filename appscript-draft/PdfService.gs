function generateOrdemServicoPdf_(osId) {
  const details = getOrdemServicoDetails_(osId);
  const clientes = getRowsObject_(CONFIG.SHEETS.CLIENTES);
  const cliente = clientes.find(function (item) {
    return String(item.id_cliente || '') === String(details.os.clienteId || '');
  }) || null;

  return buildPdfFromTemplate_({
    filePrefix: 'OS',
    fileName: 'OS-' + String(details.os.id),
    templateName: 'os_pdf_template',
    templateData: {
      logoSrc: getPdfLogoSrc_(),
      ordem: details.os,
      cliente: cliente,
      itens: details.itens,
      generatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'),
    },
  });
}

function generatePropostaPdf_(payload) {
  if (!payload || !payload.clienteId) {
    throw new Error('Cliente obrigatorio.');
  }

  if (!payload.valor) {
    throw new Error('Valor obrigatorio.');
  }

  if (!payload.prazo) {
    throw new Error('Prazo obrigatorio.');
  }

  const clientes = getRowsObject_(CONFIG.SHEETS.CLIENTES);
  const cliente = clientes.find(function (item) {
    return String(item.id_cliente || '') === String(payload.clienteId);
  });

  if (!cliente) {
    throw new Error('Cliente nao encontrado.');
  }

  return buildPdfFromTemplate_({
    filePrefix: 'Proposta',
    fileName: 'Proposta-' + sanitizeFileName_(String(cliente.nome || 'Cliente')),
    templateName: 'proposta_pdf_template',
    templateData: {
      logoSrc: getPdfLogoSrc_(),
      cliente: cliente,
      valor: formatCurrencyBr_(payload.valor),
      prazo: String(payload.prazo),
      generatedAtExtenso: formatDateExtenso_(new Date()),
      generatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'),
    },
  });
}

function buildPdfFromTemplate_(options) {
  const template = HtmlService.createTemplateFromFile(options.templateName);
  const data = options.templateData || {};

  Object.keys(data).forEach(function (key) {
    template[key] = data[key];
  });

  const html = template.evaluate().getContent();
  const pdfBlob = Utilities.newBlob(html, 'text/html', options.fileName + '.html')
    .getAs(MimeType.PDF)
    .setName(options.fileName + '.pdf');

  const folder = getPdfFolder_();
  const file = folder.createFile(pdfBlob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const existingFiles = folder.getFilesByName(options.fileName + '.pdf');
  const filesToTrash = [];

  while (existingFiles.hasNext()) {
    const existing = existingFiles.next();
    if (existing.getId() !== file.getId()) {
      filesToTrash.push(existing);
    }
  }

  filesToTrash.forEach(function (existing) {
    existing.setTrashed(true);
  });

  return {
    url: file.getUrl(),
    fileId: file.getId(),
    name: file.getName(),
  };
}

function getPdfFolder_() {
  const folderId = getProp_(CONFIG.PROP_KEYS.PDF_FOLDER_ID, '');
  if (!folderId) {
    throw new Error('PDF_FOLDER_ID nao configurado.');
  }

  return DriveApp.getFolderById(folderId);
}

function getPdfLogoSrc_() {
  const logoUrl = getScriptProps_().getProperty('PDF_LOGO_URL');
  if (logoUrl) {
    return String(logoUrl).trim();
  }

  const logoFileId = getProp_(CONFIG.PROP_KEYS.PDF_LOGO_FILE_ID, '');
  if (!logoFileId) {
    return '';
  }

  const blob = DriveApp.getFileById(logoFileId).getBlob();
  return 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes());
}

function sanitizeFileName_(value) {
  return String(value || '')
    .replace(/[\\/:*?"<>|]/g, '')
    .trim();
}

function formatCurrencyBr_(value) {
  const parsed = Number(String(value || '').replace(/\./g, '').replace(',', '.'));
  if (isNaN(parsed)) return 'R$ 0,00';

  return parsed.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDateExtenso_(date) {
  var months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return date.getDate() + ' de ' + months[date.getMonth()] + ' de ' + date.getFullYear();
}

function debugPdfSetup_() {
  const folderId = getProp_(CONFIG.PROP_KEYS.PDF_FOLDER_ID, '');
  const logoFileId = getProp_(CONFIG.PROP_KEYS.PDF_LOGO_FILE_ID, '');
  const logoUrl = getScriptProps_().getProperty('PDF_LOGO_URL') || '';

  const result = {
    folderIdConfigured: Boolean(folderId),
    logoFileIdConfigured: Boolean(logoFileId),
    logoUrlConfigured: Boolean(logoUrl),
    folderName: '',
    logoName: '',
    logoContentType: '',
    logoSrcPreview: '',
  };

  if (folderId) {
    const folder = DriveApp.getFolderById(folderId);
    result.folderName = folder.getName();
  }

  if (logoFileId) {
    const file = DriveApp.getFileById(logoFileId);
    const blob = file.getBlob();
    result.logoName = file.getName();
    result.logoContentType = blob.getContentType();
    result.logoSrcPreview = 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes()).slice(0, 80) + '...';
  } else if (logoUrl) {
    result.logoSrcPreview = String(logoUrl).slice(0, 120);
  }

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function debugPdfLogoFile_() {
  const logoFileId = getProp_(CONFIG.PROP_KEYS.PDF_LOGO_FILE_ID, '');
  if (!logoFileId) {
    throw new Error('PDF_LOGO_FILE_ID nao configurado.');
  }

  const file = DriveApp.getFileById(logoFileId);
  const blob = file.getBlob();
  const src = 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes());

  const result = {
    fileId: file.getId(),
    name: file.getName(),
    contentType: blob.getContentType(),
    sizeBytes: blob.getBytes().length,
    srcPreview: src.slice(0, 120) + '...',
  };

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}
