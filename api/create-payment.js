export default async function handler(req, res) {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { plan, email, amount } = req.body;

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    const auth = Buffer
      .from(`${shopId}:${secretKey}`)
      .toString("base64");

    const paymentData = {
      amount: {
        value: Number(amount).toFixed(2),
        currency: "RUB"
      },

      capture: true,

      confirmation: {
        type: "redirect",
        return_url: "https://art-g.art"
      },

      description: `Подписка ${plan}`,

      metadata: {
        plan,
        email
      },

      receipt: {

        customer: {
          email: email
        },

        items: [
          {
            description: `Подписка ${plan}`,
            quantity: "1.00",
            amount: {
              value: Number(amount).toFixed(2),
              currency: "RUB"
            },
            vat_code: 1
          }
        ]
      }
    };

    const response = await fetch(
      "https://api.yookassa.ru/v3/payments",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Idempotence-Key": Date.now().toString(),
          "Authorization": `Basic ${auth}`
        },

        body: JSON.stringify(paymentData)
      }
    );

    const data = await response.json();

    console.log("YOOKASSA RESPONSE:", data);

    if (data.confirmation) {
      return res.status(200).json({
        success: true,
        confirmation_url: data.confirmation.confirmation_url
      });
    }

    return res.status(400).json({
      success: false,
      payment: data
    });

  } catch (e) {

    console.log("SERVER ERROR:", e);

    return res.status(500).json({
      error: e.message
    });
  }
}
