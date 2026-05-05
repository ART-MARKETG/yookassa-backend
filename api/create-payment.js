import axios from "axios";
import { google } from "googleapis";

// === Google Sheets ===
async function getSheetData() {
  console.log("STEP 1: START GOOGLE");

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const spreadsheetId = "19FGqv8Zm2P5aFE3VCHGmp_l7hQIsmWzWc-Ao-BybFg";

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Лист1!A:F",
  });

  console.log("STEP 2: GOOGLE OK");

  return response.data.values;
}

// === YooKassa ===
async function createPayment(amount, email) {
  console.log("STEP 3: START PAYMENT");

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  console.log("SHOP_ID:", shopId ? "OK" : "MISSING");
  console.log("SECRET_KEY:", secretKey ? "OK" : "MISSING");

  const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");

  const response = await axios.post(
    "https://api.yookassa.ru/v3/payments",
    {
      amount: {
        value: amount,
        currency: "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: "https://your-site.com",
      },
      capture: true,
      description: `Подписка для ${email}`,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
    }
  );

  console.log("STEP 4: PAYMENT OK");

  return response.data;
}

// === Handler ===
export default async function handler(req, res) {
  console.log("STEP 0: HANDLER START");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = await getSheetData();

    const rows = data.slice(1);
    const activeUsers = rows.filter(row => row[5] === "active");

    const results = [];

    for (const row of activeUsers) {
      const email = row[0];
      const amount = "100.00";

      const payment = await createPayment(amount, email);

      results.push({
        email,
        paymentId: payment.id,
      });
    }

    return res.status(200).json({
      success: true,
      payments: results,
    });

  } catch (error) {
    console.error("ERROR:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}
