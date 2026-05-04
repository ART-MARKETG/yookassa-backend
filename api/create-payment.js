export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const plan = req.query.plan;
    const email = req.query.email || "unknown";

    let amount = "990.00";

    if (plan === "pro") amount = "1990.00";
    if (plan === "vip") amount = "4990.00";

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": Date.now().toString(),
        "Authorization":
          "Basic " +
          Buffer.from(
            process.env.YOOKASSA_SHOP_ID +
              ":" +
              process.env.YOOKASSA_SECRET_KEY
          ).toString("base64"),
      },
      body: JSON.stringify({
        amount: {
          value: amount,
          currency: "RUB",
        },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: "https://art-g.art",
        },
        description: `Подписка (${plan})`,
        receipt: {
          customer: {
            email: email,
          },
          items: [
            {
              description: `Подписка (${plan})`,
              quantity: "1.00",
              amount: {
                value: amount,
                currency: "RUB",
              },
              vat_code: 1,
              payment_mode: "full_prepayment",
              payment_subject: "service",
            },
          ],
        },
      }),
    });

    const data = await response.json();

    if (!data.confirmation) {
      return res.status(500).json({
        error: "Ошибка ЮKassa",
        data,
      });
    }

    return res.redirect(data.confirmation.confirmation_url);
  } catch (error) {
    return res.status(500).json({
      error: "Ошибка сервера",
      details: error.message,
    });
  }
}
