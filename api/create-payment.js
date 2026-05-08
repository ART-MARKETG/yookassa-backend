import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { email, amount, plan } = req.body;

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    const auth = Buffer.from(
      `${shopId}:${secretKey}`
    ).toString("base64");

    const payment = await axios.post(
      "https://api.yookassa.ru/v3/payments",
      {
        amount: {
          value: amount,
          currency: "RUB",
        },

        capture: true,

        confirmation: {
          type: "redirect",
          return_url: "https://art-g.art/",
        },

        description: `Подписка ${plan}`,

        metadata: {
          email,
          plan,
        },
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Idempotence-Key": Date.now().toString(),
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({
      confirmation_url:
        payment.data.confirmation.confirmation_url,
    });
  } catch (error) {
    console.log(error.response?.data || error.message);

    return res.status(500).json({
      error: "Payment failed",
    });
  }
}
