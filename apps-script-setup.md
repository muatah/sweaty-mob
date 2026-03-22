# Sweaty Mob Lead Capture — Setup Guide

## Interactive Setup Page

Use the visual guide to set up Google Sheets integration:
https://www.perplexity.ai/computer/a/sweaty-mob-form-setup-jTcQIkerQ_O00ogUxT1sjA

## Google Sheet

Leads are stored here:
https://docs.google.com/spreadsheets/d/1pMllAU5MW2HSn7yw2RS2zQCGxDdWesNJrIf_1rUf3uc/edit

Columns: Timestamp | Name | Email | Interest | Source Page

## How It Works

1. Visitor fills out a form on sweatymob.org
2. Form POSTs data to a Google Apps Script web app endpoint
3. The script writes a new row to the Google Sheet above
4. Visitor sees a confirmation message

## Fallback

If the endpoint URL hasn't been configured yet (`FORM_ENDPOINT` is empty in app.js),
form submissions will open a pre-filled email to admin@sweatymob.org with the lead info.

## To Update the Endpoint URL

Open `app.js` and update line ~260:

```javascript
var FORM_ENDPOINT = 'https://script.google.com/macros/s/YOUR-ID-HERE/exec';
```

Replace `YOUR-ID-HERE` with the URL from Step 3 of the setup page.
