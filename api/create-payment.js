export default async function handler(req, res) {
  try {
    // 🔥 РАЗРЕШАЕМ GET (ВАЖНО)
    const { plan } = req.query;

    let amount = "990.00";

    if (plan === "pro") amount = "1990.00";
    if (plan === "vip") amount = "4990.00";

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': Math.random().toString(),
        'Authorization': 'Basic ' + Buffer.from(
          process.env.YOOKASSA_SHOP_ID + ':' + process.env.YOOKASSA_SECRET_KEY
        ).toString('base64')
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
        description: `Подписка ${plan}`
      })
    });

    const data = await response.json();

    // 🔥 ВАЖНО — ПРОВЕРКА ОШИБКИ
    if (!data.confirmation) {
      console.log("YOOKASSA ERROR:", data);
      return res.status(500).json({ error: "Ошибка ЮKassa", data });
    }

    return res.redirect(data.confirmation.confirmation_url);

  } catch (error) {
    console.log("SERVER ERROR:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
}
