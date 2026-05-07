export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });

  }

  try {

    const {
      plan,
      email,
      amount
    } = req.body;

    const shopId =
      process.env.YOOKASSA_SHOP_ID;

    const secretKey =
      process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {

      return res.status(500).json({
        success: false,
        error: "ENV NOT FOUND"
      });

    }

    const auth = Buffer
      .from(`${shopId}:${secretKey}`)
      .toString("base64");

    const idempotenceKey =
      Date.now().toString();

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

    };

    console.log("SEND:");
    console.log(paymentData);

    const response = await fetch(
      "https://api.yookassa.ru/v3/payments",
      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          "Authorization":
            `Basic ${auth}`,

          "Idempotence-Key":
            idempotenceKey

        },

        body: JSON.stringify(
          paymentData
        )

      }
    );

    const payment =
      await response.json();

    console.log("YOOKASSA:");
    console.log(payment);

    if (!response.ok) {

      return res.status(400).json({

        success: false,
        payment

      });

    }

    return res.status(200).json({

      success: true,

      confirmation_url:
        payment.confirmation
          .confirmation_url

    });

  } catch (e) {

    console.log("SERVER ERROR:");
    console.log(e);

    return res.status(500).json({

      success: false,
      error: e.message

    });

  }

}
