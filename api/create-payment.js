import YooKassa from "yookassa";

const yooKassa = new YooKassa({
  shopId: process.env.YOOKASSA_SHOP_ID,
  secretKey: process.env.YOOKASSA_SECRET_KEY,
});

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { email, plan } = req.body;

    const prices = {
      base: "10.00",
    };

    const amount = prices[plan] || "10.00";

    const idempotenceKey =
      Math.random().toString(36).substring(2, 15);

    const payment = await yooKassa.createPayment(
      {
        amount: {
          value: amount,
          currency: "RUB",
        },

        capture: true,

        confirmation: {
          type: "redirect",
          return_url: "https://art-g.art/success",
        },

        description: `Подписка ${plan}`,

        save_payment_method: true,

        metadata: {
          email,
          plan,
        },
      },
      idempotenceKey
    );

    return res.status(200).json({
      confirmation_url:
        payment.confirmation.confirmation_url,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}
