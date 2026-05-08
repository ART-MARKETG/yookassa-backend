import axios from "axios";

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

    const auth = Buffer
      .from(
        `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`
      )
      .toString("base64");

    const response = await axios.post(

      "https://api.yookassa.ru/v3/payments",

      {
        amount: {
          value: Number(amount).toFixed(2),
          currency: "RUB"
        },

        capture: true,

        save_payment_method: true,

        confirmation: {
          type: "redirect",
          return_url: "https://art-g.art/"
        },

        description: `Подписка ${plan}`,

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
                value: Number(amount).toFixed(2),
                currency: "RUB"
              },

              vat_code: 1,

              payment_mode: "full_payment",

              payment_subject: "service"
            }
          ]
        }
      },

      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Idempotence-Key": Date.now().toString(),
          "Content-Type": "application/json"
        }
      }
    );

    return res.status(200).json({
      confirmation_url:
        response.data.confirmation.confirmation_url
    });

  } catch (error) {

    console.log(
      error.response?.data || error.message
    );

    return res.status(500).json({
      error: "Payment failed"
    });
  }
}
