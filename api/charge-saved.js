import axios from "axios";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const {
      payment_method_id,
      amount
    } = req.body;

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

        payment_method_id,

        description: "Автосписание подписки"
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
      success: true,
      payment: response.data
    });

  } catch (error) {

    console.log(
      error.response?.data || error.message
    );

    return res.status(500).json({
      error: "Charge failed"
    });
  }
}
