const RSVP_HEADERS = [
  'Session ID', 'Sist oppdatert', 'Familienavn', 'E-post', 'Kommer',
  'Antall personer', 'Navn på gjester', 'Matbehov', 'Melding'
];

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSettings() {
  const properties = PropertiesService.getScriptProperties();
  return {
    spreadsheetId: properties.getProperty('SPREADSHEET_ID'),
    sharedSecret: properties.getProperty('RSVP_SHARED_SECRET')
  };
}

function getRsvpSheet() {
  const settings = getSettings();
  const spreadsheet = SpreadsheetApp.openById(settings.spreadsheetId);
  let sheet = spreadsheet.getSheetByName('Svar');
  if (!sheet) sheet = spreadsheet.insertSheet('Svar');
  if (sheet.getLastRow() === 0) sheet.appendRow(RSVP_HEADERS);
  return sheet;
}

function findSessionRow(sheet, sessionId) {
  if (sheet.getLastRow() < 2) return 0;
  const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  const index = ids.findIndex(row => row[0] === sessionId);
  return index < 0 ? 0 : index + 2;
}

function getResponse(request) {
  const sheet = getRsvpSheet();
  const rowNumber = findSessionRow(sheet, request.sessionId);
  if (!rowNumber) return jsonResponse({ ok: true, found: false });
  const row = sheet.getRange(rowNumber, 1, 1, RSVP_HEADERS.length).getValues()[0];
  return jsonResponse({ ok: true, found: true, data: {
    familyName: row[2], email: row[3], attending: row[4], guestCount: row[5],
    guestNames: row[6], dietaryNeeds: row[7], message: row[8]
  }});
}

function doPost(event) {
  const request = JSON.parse(event.postData.contents);
  const settings = getSettings();
  if (request.token !== settings.sharedSecret) return jsonResponse({ ok: false, error: 'Unauthorized' });
  if (request.action === 'get') return getResponse(request);
  if (request.action !== 'upsert') return jsonResponse({ ok: false, error: 'Unsupported action' });

  const data = request.data;
  const values = [request.sessionId, new Date(), data.familyName, data.email, data.attending,
    data.guestCount, data.guestNames, data.dietaryNeeds, data.message];
  const sheet = getRsvpSheet();
  const rowNumber = findSessionRow(sheet, request.sessionId);
  if (rowNumber) sheet.getRange(rowNumber, 1, 1, values.length).setValues([values]);
  else sheet.appendRow(values);
  return jsonResponse({ ok: true });
}
