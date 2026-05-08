import { google } from "googleapis";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const event = req.body;

    if (event.event !== "payment.succeeded") {
      return res.status(200).json({
        received: true
      });
    }

    const payment = event.object;

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
      },
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets"
      ]
    });

    const sheets = google.sheets({
      version: "v4",
      auth
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Sheet1!A:G",
      valueInputOption: "USER_ENTERED",

      requestBody: {
        values: [[
          payment.metadata?.email || "",
          payment.id,
          payment.payment_method?.id || "",
          payment.metadata?.plan || "monthly",
          new Date().toISOString().split("T")[0],
          "",
          "active"
        ]]
      }
    });

    return res.status(200).json({
      received: true
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });

  }
}
