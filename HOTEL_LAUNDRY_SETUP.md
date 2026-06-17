# Jumla Laundry Hotel App Setup

New GitHub Pages page:

`hotel-laundry.html`

## Google Sheets

The hotel app sends these fields to the same Apps Script web app URL used by the existing laundry page:

- Date
- Hotel Name
- Weight in KG
- WhatsApp Number
- Note
- Created Timestamp
- Target Sheet
- Record Type

Each hotel should write to its own sheet tab:

- Hotel Pauwa
- Hotel Royal Karnali Paradise
- Kanjirowa Hotel

The spreadsheet link provided as reference is currently an uploaded `.xlsx` file. Apps Script can read/write normal Google Sheets tabs, so convert that file to a native Google Sheet before using it as the live database.

## Apps Script Change

Open the Apps Script project used by the current laundry app, then copy the helper code from `hotel-laundry-apps-script.gs`.

At the very top of the existing `doPost(e)` function, add:

```js
if (e.parameter && e.parameter["Record Type"] === "Hotel Laundry") {
  return handleHotelLaundryPost(e);
}
```

Leave the old laundry app saving code below that line unchanged.

If the Apps Script is bound to the correct Google Sheet, leave `HOTEL_LAUNDRY_SPREADSHEET_ID` empty. If it is standalone, paste the converted native Google Sheet ID into `HOTEL_LAUNDRY_SPREADSHEET_ID`.

After saving Apps Script, deploy a new web app version with the same access settings as the old laundry app.
