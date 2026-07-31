function checkWeekActivityDatesAndNotifyDiscord() {
  // Input Discord WebhookURL
  // Please Input DiscordBot WebhookURL below
  const webhookUrl = ""; //
 
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
  today.setHours(0, 0, 0, 0); // reset hours
  
  let targetDates = []; // array for week dates
  
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    targetDates.push(formatDateToJapanese(nextDate));
  }
  Logger.log(targetDates)
  
  const startDateStr = targetDates[0];
  const endDateStr = targetDates[targetDates.length - 1];

  const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  
  let fieldMessages = [];

  for (let i = 0; i < data.length; i++) {
    const rowNum = i + 2; 
    const eVal = data[i][4]; // E列
    const fVal = data[i][5]; // F列
    
    if (!fVal) continue;
    
    let targetDateStr = "";
    
    targetDateStr = formatDateToJapanese(fVal);
    Logger.log(targetDateStr);

    if (targetDates.includes(targetDateStr) && eVal === true) {
      const rowInfo = data[i][0] ? ` (${data[i][0]})` : "";
      fieldMessages.push(`・**${targetDateStr}**${rowInfo}`);
    }
  }

  if (fieldMessages.length > 0) {
    
    const description = `対象期間: **${startDateStr} 〜 ${endDateStr}**\n\n` + fieldMessages.join("\n");

    const payload = {
      //"content": "今週の固定活動日の通知です",
      
      "embeds": [{
        "title": "📅今週の絶妖星乱舞 固定活動日🎮️",
        "description": description,
        "color": 3066993,
        "timestamp": new Date().toISOString()
      }]
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
  return `${dateStr}(${dayStr})`;
}
