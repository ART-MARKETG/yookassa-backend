import axios from "axios";

export default async function handler(req, res) {
  // CORS (чтобы с фронта работало)
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
    const { amount, email } = req.body;

    if (!amount || !email) {
      return res.status(400).json({ error: "Missing amount or email" });
    }

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    const response = await axios.post(
      "https://api.yookassa.ru/v3/payments",
      {
        amount: {
          value: amount,
          currency: "RUB",
        },
        confirmation: {
          type: "redirect",
          return_url: "https://your-site.com/success",
        },
        capture: true,
        description: `Оплата от ${email}`,
        metadata: {
          email: email,
        },
      },
      {
        auth: {
          username: shopId,
          password: secretKey,
        },
        headers: {
          "Idempotence-Key": Math.random().toString(36).substring(2),
        },
      }
    );

    return res.status(200).json({
      confirmation_url: response.data.confirmation.confirmation_url,
      payment_id: response.data.id,
    });

  } catch (error) {
    console.error("ERROR:", error?.response?.data || error.message);

    return res.status(500).json({
      error: "Payment creation failed",
      details: error?.response?.data || error.message,
    });
  }
}
