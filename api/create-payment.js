export default async function handler(req, res) {
  console.log("METHOD:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { plan, email, amount } = req.body;

    console.log("DATA:", plan, email, amount);

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": Math.random().toString(),
        "Authorization": "Basic " + Buffer.from(
          process.env.YOOKASSA_SHOP_ID + ":" + process.env.YOOKASSA_SECRET_KEY
        ).toString("base64")
      },
      body: JSON.stringify({
        amount: {
          value: amount,
          currency: "RUB"
        },
        confirmation: {
          type: "redirect",
          return_url: "https://art-g.art"
        },
        capture: true,
        description: `Подписка ${plan} (${email})`,

        receipt: {
          customer: {
            email: email
          },
          items: [
            {
              description: `Подписка ${plan}`,
              quantity: "1.00",
              amount: {
                value: amount,
                currency: "RUB"
              },
              vat_code: 1,
              payment_mode: "full_prepayment",
              payment_subject: "service"
            }
          ]
        }
      })
    });

    const data = await response.json();

    console.log("YooKassa:", data);

    if (data.confirmation && data.confirmation.confirmation_url) {
      return res.status(200).json({
        confirmation_url: data.confirmation.confirmation_url
      });
    } else {
      return res.status(400).json(data);
    }

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
