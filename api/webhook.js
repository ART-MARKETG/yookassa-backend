import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const event = req.body;

    // 👉 проверяем успешную оплату
    if (event.event === "payment.succeeded") {
      const payment = event.object;

      const email = payment.metadata?.email || "no-email";
      const amount = payment.amount?.value || "0";
      const paymentId = payment.id;

      // === Google Sheets ===
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth });

      const spreadsheetId = "19FGqv8Zm2P5aFE3VCHGmp_l7hQIsmWzWc-Ao-BybFg";

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Лист1!A:D",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            [
              new Date().toISOString(),
              email,
              amount,
              paymentId,
            ],
          ],
        },
      });
    }

    return res.status(200).json({ status: "ok" });

  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    return res.status(500).json({ error: "Webhook failed" });
  }
}
