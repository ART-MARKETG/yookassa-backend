export default async function handler(req, res) {

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

    const idempotenceKey =
      Date.now().toString();

    const response = await fetch(
      "https://api.yookassa.ru/v3/payments",
      {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          "Authorization":
            `Basic ${auth}`,

          "Idempotence-Key":
            idempotenceKey
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

          description:
            `Подписка ${plan}`,

          metadata: {
            email: email,
            plan: plan
          },

          receipt: {

            customer: {
              email: email
            },

            items: [

              {

                description:
                  `Подписка ${plan}`,

                quantity: "1.00",

                amount: {
                  value:
                    Number(amount).toFixed(2),
                  currency: "RUB"
                },

                vat_code: 1,

                payment_mode:
                  "full_payment",

                payment_subject:
                  "service"

              }

            ]

          }

        })

      }
    );

    const payment =
      await response.json();

    console.log(payment);

    return res.status(200).json({

      success: true,

      confirmation_url:
        payment.confirmation
          ?.confirmation_url,

      payment

    });

  } catch (e) {

    console.log(e);

    return res.status(500).json({

      success: false,
      error: e.message

    });

  }

}
