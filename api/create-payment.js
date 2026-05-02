export default async function handler(req, res) {
  const shopId = "1242806";
  const secretKey = "live_ZJsOSAOhQada3QvM7HBTNV_vE3SDLwnksLsdqhC6wr4";

  const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");

  const body = {
    amount: {
      value: "990.00",
      currency: "RUB",
    },
    confirmation: {
      type: "redirect",
      return_url: "https://yookassa-backend.vercel.app",
    },
    capture: true,
    description: "Подписка",

    receipt: {
      customer: {
        email: "test@example.com"
      },
      items: [
        {
          description: "Подписка",
          quantity: "1.00",
          amount: {
            value: "990.00",
            currency: "RUB"
          },
          vat_code: 1
        }
      ]
    }
  };

  try {
    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
        "Idempotence-Key": Date.now().toString(),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!data.confirmation) {
      return res.status(400).json(data);
    }

    res.status(200).json({
      url: data.confirmation.confirmation_url,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
}
