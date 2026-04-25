function findRowIndexById_(sheetName, id, idColumnName) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) return -1;

  const idColumnIndex = headers.findIndex(function (header) {
    return String(header).trim() === idColumnName;
  });

  if (idColumnIndex === -1) {
    throw new Error('Coluna de ID nao encontrada em ' + sheetName + ': ' + idColumnName);
  }

  const values = sheet.getRange(2, idColumnIndex + 1, lastRow - 1, 1).getValues();

  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      return i + 2;
    }
  }

  return -1;
}

function updateObjectById_(sheetName, id, idColumnName, obj) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const rowIndex = findRowIndexById_(sheetName, id, idColumnName);

  if (rowIndex === -1) {
    throw new Error('Registro nao encontrado em ' + sheetName + ': ' + id);
  }

  const row = headers.map(function (header) {
    return obj[header] !== undefined ? obj[header] : '';
  });

  sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  return obj;
}

function deleteRowById_(sheetName, id, idColumnName) {
  const rowIndex = findRowIndexById_(sheetName, id, idColumnName);

  if (rowIndex === -1) {
    throw new Error('Registro nao encontrado em ' + sheetName + ': ' + id);
  }

  getSheet_(sheetName).deleteRow(rowIndex);
}

function getNextNumericId_(sheetName, idColumnName, length) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return padNumber_(1, length || 4);
  }

  const idColumnIndex = headers.findIndex(function (header) {
    return String(header).trim() === idColumnName;
  });

  if (idColumnIndex === -1) {
    throw new Error('Coluna de ID nao encontrada em ' + sheetName + ': ' + idColumnName);
  }

  const values = sheet.getRange(2, idColumnIndex + 1, lastRow - 1, 1).getValues();
  const numbers = values
    .map(function (row) {
      return Number(String(row[0] || '').replace(/\D/g, ''));
    })
    .filter(function (value) {
      return !isNaN(value) && value > 0;
    });

  const next = numbers.length ? Math.max.apply(null, numbers) + 1 : 1;
  return padNumber_(next, length || 4);
}

function getNextSequenceId_(sheetName, idColumnName, propKey, length) {
  const props = PropertiesService.getScriptProperties();
  const current = Number(props.getProperty(propKey) || '0');

  if (current > 0) {
    const next = current + 1;
    props.setProperty(propKey, String(next));
    return padNumber_(next, length || 4);
  }

  const seed = getMaxNumericIdFromSheet_(sheetName, idColumnName);
  const next = seed + 1;
  props.setProperty(propKey, String(next));
  return padNumber_(next, length || 4);
}

function getMaxNumericIdFromSheet_(sheetName, idColumnName) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) return 0;

  const idColumnIndex = headers.findIndex(function (header) {
    return String(header).trim() === idColumnName;
  });

  if (idColumnIndex === -1) {
    throw new Error('Coluna de ID nao encontrada em ' + sheetName + ': ' + idColumnName);
  }

  const values = sheet.getRange(2, idColumnIndex + 1, lastRow - 1, 1).getValues();
  const numbers = values
    .map(function (row) {
      return Number(String(row[0] || '').replace(/\D/g, ''));
    })
    .filter(function (value) {
      return !isNaN(value) && value > 0;
    });

  return numbers.length ? Math.max.apply(null, numbers) : 0;
}

function padNumber_(value, length) {
  return String(value).padStart(length || 4, '0');
}
