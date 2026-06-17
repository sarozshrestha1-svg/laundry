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
};

const HOTEL_LAUNDRY_HEADERS = [
  "Date",
  "Hotel name",
  "Weight in KG",
  "WhatsApp number",
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
    hotelName || "",
    data["Weight in KG"] || "",
    data["WhatsApp Number"] || "",
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
