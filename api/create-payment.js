export default async function handler(req, res) {
  try {
    const { plan, email } = req.query;

    let amount = "990.00";

    if (plan === "pro") amount = "1990.00";
    if (plan === "vip") amount = "4990.00";

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.YOOKASSA_SHOP_ID +
              ":" +
              process.env.YOOKASSA_SECRET_KEY
          ).toString("base64"),
        "Idempotence-Key": Math.random().toString(),
      },
      body: JSON.stringify({
        amount: {
          value: amount,
          currency: "RUB",
        },
        confirmation: {
          type: "redirect",
          return_url: "https://art-g.art",
        },
        capture: true,
        description: `Подписка (${plan})`,

        // ✅ сохраняем email
        metadata: {
          email: email || "unknown",
        },
      }),
    });

    const data = await response.json();

    // логируем ошибку если есть
    if (!data.confirmation) {
      console.log("YOOKASSA ERROR:", data);
      return res.status(400).json(data);
    }

    // редирект на оплату
    return res.redirect(302, data.confirmation.confirmation_url);
  } catch (error) {
    console.log("SERVER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
