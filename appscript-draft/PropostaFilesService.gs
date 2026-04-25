function listProposalFiles_() {
  const folder = getPdfFolder_();
  const files = folder.getFiles();
  const result = [];

  while (files.hasNext()) {
    const file = files.next();
    const name = String(file.getName() || '');

    if (!/^Proposta-/i.test(name)) {
      continue;
    }

    result.push({
      id: file.getId(),
      name: name,
      url: file.getUrl(),
      createdAt: file.getDateCreated().toISOString(),
      updatedAt: file.getLastUpdated().toISOString(),
      sizeBytes: file.getSize(),
    });
  }

  result.sort(function (a, b) {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return result;
}
