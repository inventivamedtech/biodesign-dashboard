/**
 * Biodesign Dashboard - Google Apps Script
 *
 * Usa doGet com parametros na URL (POST bloqueado em contas Workspace).
 *
 * Setup:
 * 1. Abra a planilha no Chrome
 * 2. Extensoes -> Apps Script
 * 3. Cole este codigo inteiro no editor (substituindo tudo)
 * 4. Implantar -> Nova implantacao -> App da Web
 *    - Executar como: Eu
 *    - Quem tem acesso: Qualquer pessoa
 * 5. Copie a URL do deploy
 *
 * Uso via GET:
 * ?action=update&sheet=Observacoes&idColumn=id_mae&idValue=OBS-001&column=Potencial (0-3)&value=3
 * ?action=append&sheet=Observacoes&col_id_mae=OBS-045&col_Potencial (0-3)=1&col_Tipo=Dispositivos&col_Observations=texto
 */

function doGet(e) {
  var action = (e.parameter.action || '').trim();

  if (action === 'update') {
    return handleUpdate(e.parameter);
  }

  if (action === 'append') {
    return handleAppend(e.parameter);
  }

  return jsonResponse({ status: "ok", message: "Biodesign API ativa" });
}

function handleUpdate(params) {
  try {
    var sheetName = params.sheet;
    var idColumn  = params.idColumn;
    var idValue   = params.idValue;
    var column    = params.column;
    var value     = params.value;

    if (!sheetName || !idColumn || !idValue || !column || value === undefined) {
      return jsonResponse({ success: false, error: "Parametros faltando" });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return jsonResponse({ success: false, error: "Aba nao encontrada: " + sheetName });
    }

    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var headers = values[0];

    var idColIndex = headers.indexOf(idColumn);
    var targetColIndex = headers.indexOf(column);

    if (idColIndex === -1) {
      return jsonResponse({ success: false, error: "Coluna ID nao encontrada: " + idColumn });
    }
    if (targetColIndex === -1) {
      return jsonResponse({ success: false, error: "Coluna alvo nao encontrada: " + column });
    }

    for (var i = 1; i < values.length; i++) {
      if (String(values[i][idColIndex]).trim() === String(idValue).trim()) {
        var numValue = Number(value);
        sheet.getRange(i + 1, targetColIndex + 1).setValue(isNaN(numValue) ? value : numValue);

        return jsonResponse({
          success: true,
          row: i + 1,
          sheet: sheetName,
          id: idValue,
          column: column,
          value: value
        });
      }
    }

    return jsonResponse({ success: false, error: "ID nao encontrado: " + idValue });

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function handleAppend(params) {
  try {
    var sheetName = params.sheet;
    if (!sheetName) {
      return jsonResponse({ success: false, error: "Parametro 'sheet' faltando" });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return jsonResponse({ success: false, error: "Aba nao encontrada: " + sheetName });
    }

    var headers = sheet.getDataRange().getValues()[0];
    var newRow = [];

    for (var i = 0; i < headers.length; i++) {
      var paramKey = "col_" + headers[i];
      var val = params[paramKey];
      if (val !== undefined) {
        var numVal = Number(val);
        newRow.push(isNaN(numVal) ? val : numVal);
      } else {
        newRow.push("");
      }
    }

    sheet.appendRow(newRow);
    var lastRow = sheet.getLastRow();

    return jsonResponse({
      success: true,
      row: lastRow,
      sheet: sheetName
    });

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
