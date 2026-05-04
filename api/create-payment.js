import fetch from "node-fetch";

export default async function handler(req, res) {

  try {

    // ✅ получаем параметры из URL
    const { plan, amount, email } = req.query;

    console.log("PLAN:", plan);
    console.log("AMOUNT:", amount);
    console.log("EMAIL:", email);

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");

    const paymentData = {
      amount: {
        value: amount || "10.00",
        currency: "RUB"
      },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: "https://art-g.art/"
      },
      description: `Подписка (${plan})`,
      metadata: {
        email: email,
        plan: plan
      },

      // ✅ ВАЖНО: чек (иначе у тебя была ошибка receipt)
      receipt: {
        customer: {
          email: email
        },
        items: [
          {
            description: `Подписка ${plan}`,
            quantity: "1.00",
            amount: {
              value: amount || "10.00",
              currency: "RUB"
            },
            vat_code: 1
          }
        ]
      }
    };

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`,
        "Idempotence-Key": Math.random().toString(36).substring(7)
      },
      body: JSON.stringify(paymentData)
    });

    const data = await response.json();

    if (!data.confirmation) {
      console.log("ERROR RESPONSE:", data);
      return res.status(500).json(data);
    }

    console.log("PAYMENT CREATED FOR:", email);

    return res.redirect(data.confirmation.confirmation_url);

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
