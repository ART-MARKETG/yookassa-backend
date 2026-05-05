export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, email } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "No amount" });
    }

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      return res.status(500).json({ error: "No credentials" });
    }

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
        "Idempotence-Key": Math.random().toString(36).substring(7),
      },
      body: JSON.stringify({
        amount: {
          value: amount,
          currency: "RUB",
        },
        confirmation: {
          type: "redirect",
          return_url: "https://example.com",
        },
        capture: true,
        description: "Test payment",
        receipt: {
          customer: {
            email: email || "test@mail.ru",
          },
          items: [
            {
              description: "Оплата",
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
    console.error("ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
