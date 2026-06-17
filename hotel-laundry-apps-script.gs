/**
 * Add this hotel route to the same Apps Script web app used by the existing
 * laundry page. Keep the old customer-billing doPost logic for all other posts.
 */

// If this Apps Script is bound to the working laundry Google Sheet, leave this
// empty. If it is a standalone Apps Script, paste the native Google Sheet ID.
// The provided reference file is an .xlsx upload, so convert it to Google Sheets
// format first if you want this script to write into that workbook.
const HOTEL_LAUNDRY_SPREADSHEET_ID = "";

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

/**
 * In your existing doPost(e), add this at the very top:
 *
 * if (e.parameter && e.parameter["Record Type"] === "Hotel Laundry") {
 *   return handleHotelLaundryPost(e);
 * }
 *
 * Then leave the old laundry app saving code below it unchanged.
 */
