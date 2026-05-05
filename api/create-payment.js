import axios from "axios";
import { google } from "googleapis";

// === Google Sheets ===
async function getSheetData() {
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

  return response.data.values;
}

// === YooKassa ===
async function createPayment(amount, email) {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

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

  return response.data;
}

// === Handler ===
export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Получаем данные из таблицы
    const data = await getSheetData();

    // 2. Убираем заголовки
    const rows = data.slice(1);

    // 3. Фильтруем активных
    const activeUsers = rows.filter(row => row[5] === "active");

    const results = [];

    for (const row of activeUsers) {
      const email = row[0];
      const paymentMethodId = row[1];
      const plan = row[2];

      // 👉 временно фикс сумма
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
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}
