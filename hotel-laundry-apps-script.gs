/**
 * Standalone Google Apps Script web app for hotel laundry collection.
 * Deploy as a Web App and paste the /exec URL into hotel-laundry.html.
 */

// If this Apps Script is bound to the working laundry Google Sheet, leave this
// empty. If it is a standalone Apps Script, paste the native Google Sheet ID.
// The provided reference file is an .xlsx upload, so convert it to Google Sheets
// format first if you want this script to write into that workbook.
const HOTEL_LAUNDRY_SPREADSHEET_ID = "1v_bBUgIPO26xWM4TOm4kjDcvP8RPeg17FHO5ZqNEFqI";

const HOTEL_LAUNDRY_SHEETS = {
  "Hotel Pauwa": "Hotel Pauwa",
  "Hotel Royal Karnali Paradise": "Hotel Royal Karnali Paradise",
  "Kanjirowa Hotel": "Kanjirowa Hotel",
  "Genz Cafe": "Genz Cafe",
};

const HOTEL_LAUNDRY_HEADERS = [
  "Date",
  "Weight in KG",
  "Note",
  "Created timestamp",
];

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, app: "Jumla Laundry Hotel Records" }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    return handleHotelLaundryPost(e);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: error.message }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleHotelLaundryPost(e) {
  const data = e.parameter || {};
  const hotelName = data["Hotel Name"];
  const sheetName = HOTEL_LAUNDRY_SHEETS[hotelName];

  if (!sheetName) {
    throw new Error("Unknown hotel name: " + hotelName);
  }

  const spreadsheet = getHotelLaundrySpreadsheet_();
  const sheet = getOrCreateHotelLaundrySheet_(spreadsheet, sheetName);

  sheet.appendRow([
    data["Date"] || "",
    data["Weight in KG"] || "",
    data["Note"] || "",
    data["Created Timestamp"] || new Date(),
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, sheet: sheetName }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function getHotelLaundrySpreadsheet_() {
  if (HOTEL_LAUNDRY_SPREADSHEET_ID) {
    return SpreadsheetApp.openById(HOTEL_LAUNDRY_SPREADSHEET_ID);
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error(
      "Set HOTEL_LAUNDRY_SPREADSHEET_ID to your native Google Sheet ID.",
    );
  }

  return spreadsheet;
}

function getOrCreateHotelLaundrySheet_(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  const firstRow = sheet.getRange(1, 1, 1, HOTEL_LAUNDRY_HEADERS.length);
  const existingHeaders = firstRow.getValues()[0];
  const hasHeaders = existingHeaders.some(function (value) {
    return String(value).trim() !== "";
  });

  if (!hasHeaders) {
    firstRow.setValues([HOTEL_LAUNDRY_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function setupHotelLaundrySheets() {
  const spreadsheet = getHotelLaundrySpreadsheet_();

  Object.keys(HOTEL_LAUNDRY_SHEETS).forEach(function (hotelName) {
    getOrCreateHotelLaundrySheet_(spreadsheet, HOTEL_LAUNDRY_SHEETS[hotelName]);
  });

  return "Hotel laundry sheets are ready.";
}

function archiveCurrentMonthAndClear() {
  const spreadsheet = getHotelLaundrySpreadsheet_();
  const timezone = spreadsheet.getSpreadsheetTimeZone() || "Asia/Kathmandu";
  const monthName = Utilities.formatDate(new Date(), timezone, "yyyy-MM");
  const sourceFile = DriveApp.getFileById(spreadsheet.getId());
  const archiveName = spreadsheet.getName() + " Archive " + monthName;

  sourceFile.makeCopy(archiveName);

  Object.keys(HOTEL_LAUNDRY_SHEETS).forEach(function (hotelName) {
    const sheet = getOrCreateHotelLaundrySheet_(
      spreadsheet,
      HOTEL_LAUNDRY_SHEETS[hotelName],
    );
    clearHotelLaundryData_(sheet);
  });

  return "Archived current month as '" + archiveName + "' and cleared live hotel tabs.";
}

function clearHotelLaundryDataOnly() {
  const spreadsheet = getHotelLaundrySpreadsheet_();

  Object.keys(HOTEL_LAUNDRY_SHEETS).forEach(function (hotelName) {
    const sheet = getOrCreateHotelLaundrySheet_(
      spreadsheet,
      HOTEL_LAUNDRY_SHEETS[hotelName],
    );
    clearHotelLaundryData_(sheet);
  });

  return "Cleared live hotel tabs without making an archive copy.";
}

function clearHotelLaundryData_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = Math.max(sheet.getLastColumn(), HOTEL_LAUNDRY_HEADERS.length);

  sheet.getRange(1, 1, 1, HOTEL_LAUNDRY_HEADERS.length).setValues([
    HOTEL_LAUNDRY_HEADERS,
  ]);
  sheet.setFrozenRows(1);

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, lastColumn).clearContent();
  }
}
