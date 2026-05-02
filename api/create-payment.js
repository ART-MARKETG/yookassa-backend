export default async function handler(req, res) {
  const shopId = "1242806";
  const secretKey = "live_ZJsOSAOhQada3QvM7HBTNV_vE3SDLwnksLsdqhC6wr4"; // вставь свой

  const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");

  const body = {
    amount: {
      value: "990.00",
      currency: "RUB"
    },
    confirmation: {
      type: "redirect",
      return_url: "https://art-g.art"
    },
    capture: true,
    description: "Подписка",
    receipt: {
      customer: {
        email: "test@test.ru"
      },
      items: [
        {
          description: "Подписка",
          quantity: "1.00",
          amount: {
            value: "990.00",
            currency: "RUB"
          },
          vat_code: 1,
          payment_mode: "full_prepayment",
          payment_subject: "service"
        }
      ]
    }
  };

  try {
    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`,
        "Idempotence-Key": Date.now().toString()
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    // 🔥 ВАЖНО — РЕДИРЕКТ
    res.writeHead(302, {
      Location: data.confirmation.confirmation_url
    });
    res.end();

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}
