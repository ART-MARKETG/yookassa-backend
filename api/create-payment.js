import fetch from "node-fetch";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, plan, amount } = req.body;

    console.log("REQUEST BODY:", req.body);

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": Date.now().toString(),
        "Authorization": "Basic " + Buffer.from(
          process.env.SHOP_ID + ":" + process.env.SECRET_KEY
        ).toString("base64"),
      },
      body: JSON.stringify({
        amount: {
          value: amount,
          currency: "RUB"
        },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: "https://art-g.art"
        },
        description: "Подписка " + plan,

        receipt: {
          customer: {
            email: email
          },
          items: [
            {
              description: "Подписка " + plan,
              quantity: "1.00",
              amount: {
                value: amount,
                currency: "RUB"
              },

              // 🔥 КЛЮЧЕВОЕ
              vat_code: 1,
              payment_mode: "full_payment",
              payment_subject: "service"
            }
          ]
        }
      })
    });

    const data = await response.json();

    console.log("YOOKASSA RESPONSE:", data);

    if (!data.confirmation) {
      return res.status(500).json(data);
    }

    return res.status(200).json({
      confirmation_url: data.confirmation.confirmation_url
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({ error: "server error" });
  }
}
