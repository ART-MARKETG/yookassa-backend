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
        "Idempotence-Key": `${Date.now()}-${email}`,
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

  // 🔥 ВАЖНО: исправленная проверка метода
  if (req.method.toUpperCase() !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("METHOD:", req.method);
    console.log("BODY:", req.body);

    // 1. Получаем данные из таблицы
    const data = await getSheetData();

    if (!data || data.length === 0) {
      return res.status(400).json({ error: "No data in sheet" });
    }

    // 2. Убираем заголовки
    const rows = data.slice(1);

    // 3. Фильтруем активных
    const activeUsers = rows.filter(row => row[5] === "active");

    const results = [];

    for (const row of activeUsers) {
      const email = row[0];

      // фикс сумма (потом сделаем динамику)
      const amount = "100.00";

      const payment = await createPayment(amount, email);

      results.push({
        email,
        paymentId: payment.id,
        status: payment.status,
      });
    }

    return res.status(200).json({
      success: true,
      payments: results,
    });

  } catch (error) {
    console.error("FULL ERROR:", error?.response?.data || error.message);

    return res.status(500).json({
      error: error?.response?.data || error.message,
    });
  }
}
