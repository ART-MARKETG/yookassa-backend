export default async function handler(req, res) {

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

    const { email, amount, plan } = req.body;

    if (!email || !amount) {

      return res.status(400).json({
        error: "Missing fields"
      });

    }

    const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
    const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

    const auth = Buffer
      .from(`${SHOP_ID}:${SECRET_KEY}`)
      .toString("base64");

    const response = await fetch(
      "https://api.yookassa.ru/v3/payments",
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`,
          "Idempotence-Key": Date.now().toString()
        },

        body: JSON.stringify({

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

                vat_code: 1,

                payment_mode: "full_payment",

                payment_subject: "service"

              }

            ]

          },

          metadata: {
            email,
            plan
          }

        })

      }
    );

    const payment = await response.json();

    console.log(payment);

    return res.status(200).json({
      success: true,
      payment
    });

  } catch (e) {

    console.log(e);

    return res.status(500).json({
      error: e.message
    });

  }

}
