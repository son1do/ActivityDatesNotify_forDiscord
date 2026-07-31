function checkActivityDateAndNotifyDiscord() {
  // Input Discord WebhookURL
  // Please Input DiscordBot WebhookURL below
  const webhookUrl = ""
 
  // Get "予定表" sheet
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("予定表");
  
  if (!sheet) {
    Logger.log('Please verify that the “予定表” sheet exists in Google Sheets.');
    return;
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  
  const today = new Date();
  const todayFormatted = formatDateToJapanese(today); // example:"2026/07/31(金)"
  
  const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  
  let notificationMessages = [];

  for (let i = 0; i < data.length; i++) {
    const rowNum = i + 2;
    const eVal = data[i][4]; // E列
    const fVal = data[i][5]; // F列
    
    if (!fVal) continue;
    
    let targetDateStr = "";
    
      targetDateStr = formatDateToJapanese(fVal);
      Logger.log(targetDateStr)
      Logger.log(eVal)
    
    if (targetDateStr === todayFormatted && eVal === true) {
      const rowInfo = data[i][0] ? ` (${data[i][0]})` : "";
      notificationMessages.push(`・${rowNum}${rowInfo}`);
    }
  }

  if (notificationMessages.length > 0) {
    const message = `本日、`+todayFormatted+`　固定活動日です`;
    
    const payload = {
      "content": message
    };
    
    const options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload)
    };
    
    UrlFetchApp.fetch(webhookUrl, options);
  }
}

/**
 * Formats a Date object into a string using the specified timezone in "yyyy/MM/dd(Day)" format.
 *
 * @param {Date} date - The Date object to format.
 * @returns {string} The formatted date string (e.g., "2026/08/01(Sat)").
 */
function formatDateToJapanese(date) {
  const dayOfWeekStr = ["日", "月", "火", "水", "木", "金", "土"];
  const dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy/MM/dd");
  const dayStr = dayOfWeekStr[date.getDay()];
  Logger.log(dateStr);
  Logger.log(dayStr);
  return `${dateStr}(${dayStr})`;
}
