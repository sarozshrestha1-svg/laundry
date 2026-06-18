# Jumla Laundry Hotel App Setup

New GitHub Pages page:

`hotel-laundry.html`

## Google Sheets

The hotel app sends these fields to a separate hotel-only Apps Script web app:

- Date
- Weight in KG
- Note
- Created Timestamp
- Target Sheet
- Record Type

Records are saved in this native Google Sheet:

`https://docs.google.com/spreadsheets/d/1v_bBUgIPO26xWM4TOm4kjDcvP8RPeg17FHO5ZqNEFqI/edit`

Each hotel writes to its own sheet tab:

- Hotel Pauwa
- Hotel Royal Karnali Paradise
- Kanjirowa Hotel
- Genz Cafe

The spreadsheet link provided as reference was an uploaded `.xlsx` file, so a new native Google Sheet was created for live hotel records.

## Apps Script Change

A standalone Apps Script project was created for this hotel page. The deployed web app URL is already set in `hotel-laundry.html`.

Web app URL:

`https://script.google.com/macros/s/AKfycbwXtkYXYDTxhTv8UznkUlwIUFfUZ_kfCOVdMca7thfaZLMpj9Wgq5dSlhDbUghydqlv/exec`

The old laundry app and its Apps Script were not changed.

## Owner Month Change

The public web app cannot clear or archive data.

Only the Google account that owns the Apps Script can run these owner functions from Apps Script:

- `archiveCurrentMonthAndClear()` - makes an archive copy of the current hotel-record spreadsheet, then clears all hotel tab rows below the headers.
- `clearHotelLaundryDataOnly()` - clears all hotel tab rows below the headers without making an archive copy.

Use `archiveCurrentMonthAndClear()` at the start of a new month.
