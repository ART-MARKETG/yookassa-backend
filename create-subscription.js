import axios from "axios";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const auth = Buffer
      .from(
        `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`
      )
      .toString("base64");

    const response = await axios.post(

      "https://api.yookassa.ru/v3/payments",

      {
        amount: {
          value: "100.00",
          currency: "RUB"
        },

        capture: true,

        confirmation: {
          type: "redirect",
          return_url: "https://google.com"
        },

        save_payment_method: true,

        description: "Подписка ART-G"
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
      error: "Create payment failed"
    });
  }
}
