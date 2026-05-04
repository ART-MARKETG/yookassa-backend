export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, plan, amount } = req.body;

    console.log("EMAIL:", email);
    console.log("PLAN:", plan);
    console.log("AMOUNT:", amount);

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");

    const finalAmount = parseFloat(amount || "10").toFixed(2);

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

      metadata: {
        email,
        plan
      },

      receipt: {
        customer: {
          email
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
            payment_subject: "service",
            payment_mode: "full_payment"
          }
        ]
      }
    };

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
        "Idempotence-Key": Date.now().toString()
      },
      body: JSON.stringify(paymentData)
    });

    const data = await response.json();

    console.log("YOOKASSA:", data);

    if (!data.confirmation) {
      return res.status(500).json(data);
    }

    return res.status(200).json({
      confirmation_url: data.confirmation.confirmation_url
    });

  } catch (e) {
    console.error("ERROR:", e);
    return res.status(500).json({ error: "server error" });
  }
}
