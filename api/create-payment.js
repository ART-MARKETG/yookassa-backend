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

    // ✅ ключи
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      return res.status(500).json({ error: "Missing YooKassa credentials" });
    }

    const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");

    // ✅ нормализация суммы
    const finalAmount = parseFloat(amount || "10").toFixed(2);

    // ✅ тело платежа
    const paymentData = {
      amount: {
        value: finalAmount,
        currency: "RUB"
      },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: "https://art-g.art/"
      },
      description: `Подписка (${plan})`,

      // 🔥 сохраняем email
      metadata: {
        email: email,
        plan: plan
      },

      // 🔥 чек (обязателен)
      receipt: {
        customer: {
          email: email
        },
        items: [
          {
            description: `Подписка ${plan}`,
            quantity: "1.00",
            amount: {
              value: finalAmount,
              currency: "RUB"
            },
            vat_code: 1,

            // 🔥 ВАЖНО — фикс твоей ошибки
            payment_subject: "service",
            payment_mode: "full_payment"
          }
        ]
      }
    };

    // ✅ запрос в YooKassa (fetch встроен)
    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`,
        "Idempotence-Key": Date.now().toString()
      },
      body: JSON.stringify(paymentData)
    });

    const data = await response.json();

    console.log("YOOKASSA RESPONSE:", data);

    if (!data.confirmation) {
      return res.status(500).json(data);
    }

    console.log("SUCCESS PAYMENT FOR:", email);

    // ✅ редирект на оплату
    return res.redirect(data.confirmation.confirmation_url);

  } catch (error) {
    console.error("CRASH ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
