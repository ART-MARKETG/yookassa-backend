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
        "Authorization":
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
        
        // 🔥 ВОТ ЭТО ГЛАВНОЕ
        metadata: {
          email: email || "unknown",
        },

        receipt: {
          customer: {
            email: email || "test@mail.com",
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
              payment_mode: "full_payment",
              payment_subject: "service",
            },
          ],
        },
      }),
    });

    const data = await response.json();

    if (data.confirmation) {
      return res.redirect(302, data.confirmation.confirmation_url);
    }

    return res.status(400).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
