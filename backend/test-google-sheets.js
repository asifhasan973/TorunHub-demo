require('dotenv').config();
const { google } = require('googleapis');

async function testGoogleSheets() {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');


    if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
      return;
    }

    // Initialize Google Sheets API
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Test: Try to read the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });


    // Check if Orders sheet exists
    const sheetName = 'Orders';
    const sheetExists = spreadsheet.data.sheets.some(
      (sheet) => sheet.properties.title === sheetName
    );

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });
    } else {
    }

    // Test: Try to write a test row
    const testRow = [
      'TEST_ORDER_ID',
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
      'Test Customer',
      'test@example.com',
      'Test Product (Qty: 1)',
      '100.00',
      '0.00',
      '100.00',
      'COD',
      'pending',
      'N/A',
      'CUET',
      'Test Address',
      'pending',
      '',
      'This is a test order',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:P`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [testRow],
      },
    });


  } catch (error) {
    if (error.response) {
    }
  }
}

testGoogleSheets();

