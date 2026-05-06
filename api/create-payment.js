import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { amount, email } = req.body;

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`
          ).toString("base64"),

        "Idempotence-Key": uuidv4(),
      },

      body: JSON.stringify({
        amount: {
          value: amount,
          currency: "RUB",
        },

        capture: true,

        confirmation: {
          type: "redirect",
          return_url: "https://google.com",
        },

        description: "ART-MARKET subscription",

        receipt: {
          customer: {
            email,
          },

          items: [
            {
              description: "Подписка",
              quantity: "1.00",
              amount: {
                value: amount,
                currency: "RUB",
              },

              vat_code: 1,
            },
          ],
        },
      }),
    });

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
