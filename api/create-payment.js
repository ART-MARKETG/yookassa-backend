export default async function handler(req, res) {
  const shopId = "1242806";
  const secretKey = "live_ZJsOSAOhQada3QvM7HBTNV_vE3SDLwnksLsdqhC6wr4"; // ← вставь свой ключ

  const { plan } = req.query;

  let amount = "990.00";
  let description = "Подписка";

  // тарифы
  if (plan === "pro") {
    amount = "1990.00";
    description = "Подписка PRO";
  }

  if (plan === "vip") {
    amount = "4990.00";
    description = "Подписка VIP";
  }

  const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");

  const body = {
    amount: {
      value: amount,
      currency: "RUB"
    },
    confirmation: {
      type: "redirect",
      return_url: "https://art-g.art"
    },

    // 🔥 ВКЛЮЧАЕМ СОХРАНЕНИЕ КАРТЫ
    save_payment_method: true,

    capture: true,
    description: description,

    receipt: {
      customer: {
        email: "test@test.ru"
      },
      items: [
        {
          description: description,
          quantity: "1.00",
          amount: {
            value: amount,
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

    // 🔥 РЕДИРЕКТ НА ОПЛАТУ
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
