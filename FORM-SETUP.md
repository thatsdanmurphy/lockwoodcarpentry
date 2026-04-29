# Form Setup — Google Sheets Integration

The contact form submits to a Google Apps Script web app that writes each inquiry to a Google Sheet. No third-party service needed.

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new sheet.
2. Name it something like **Lockwood Inquiries**.
3. In row 1, add these column headers (exact order matters):

   `Timestamp` | `Name` | `Email` | `Phone` | `Project Type` | `Timeline` | `Message`

---

## Step 2 — Add the Apps Script

1. In your Google Sheet, click **Extensions → Apps Script**.
2. Delete the default code and paste the following:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data  = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.name     || '',
      data.email    || '',
      data.phone    || '',
      data.type     || '',
      data.timeline || '',
      data.message  || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Click **Save** (give the project a name like "Lockwood Form Handler").

---

## Step 3 — Deploy as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Type" and select **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**.
5. Copy the **Web app URL** — it looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

---

## Step 4 — Wire it up in main.js

Open `site/js/main.js` and replace the placeholder:

```js
// Before:
const ENDPOINT = 'YOUR_GOOGLE_APPS_SCRIPT_URL';

// After:
const ENDPOINT = 'https://script.google.com/macros/s/YOUR-ACTUAL-ID/exec';
```

Save and deploy. The form is live.

---

## Notes

- Every form submission appends a new row to your sheet.
- You'll get an email notification from Google if the script fails (configure under Apps Script → Triggers if you want additional alerts).
- If you switch to Outlook or another service later, this setup can be replaced — just update the ENDPOINT in main.js. The form HTML and JS handler stay the same.
- The form works in "placeholder mode" before the endpoint is set — it simulates a success response so the UI can be reviewed without errors.
