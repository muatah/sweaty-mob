# Sweaty Mob Lead Capture — Google Apps Script Setup

## Quick Setup (5 minutes)

### Step 1: Open the Script Editor
1. Go to your Google Sheet: [Sweaty Mob — Lead Captures](https://docs.google.com/spreadsheets/d/1pMllAU5MW2HSn7yw2RS2zQCGxDdWesNJrIf_1rUf3uc/edit)
2. Click **Extensions** → **Apps Script**

### Step 2: Paste the Code
Delete any existing code in the editor and paste this:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    new Date().toLocaleString('en-US', {timeZone: 'America/New_York'}),
    data.name || '',
    data.email || '',
    data.interest || '',
    data.source || ''
  ]);
  
  return ContentService
    .createTextOutput(JSON.stringify({status: 'success'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: 'ok', message: 'Sweaty Mob Lead Capture is running'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Step 3: Deploy
1. Click **Deploy** → **New deployment**
2. Click the gear icon next to "Select type" → choose **Web app**
3. Set:
   - **Description**: "Sweaty Mob Lead Capture"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone"
4. Click **Deploy**
5. Click **Authorize access** and follow the Google sign-in prompts
6. Copy the **Web app URL** — it looks like: `https://script.google.com/macros/s/XXXXX/exec`

### Step 4: Update Your Website
Open `index.html` and find this line near the top of the `<script>` section at the bottom:

```javascript
const FORM_ENDPOINT = '';
```

Replace it with your URL:

```javascript
const FORM_ENDPOINT = 'https://script.google.com/macros/s/YOUR-ID-HERE/exec';
```

That's it! Forms will now capture leads directly to your Google Sheet.

---

## Testing
After deploying, test by submitting the form on your site. Check your Google Sheet — a new row should appear within a few seconds.
