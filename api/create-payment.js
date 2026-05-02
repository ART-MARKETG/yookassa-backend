export default async function handler(req, res) {
  const shopId = "1242806";
  const secretKey = "live_KyQoKe1MsO8OL6CznzxvkADQETdwJ34OPZOvBJ4yp4E";

  const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");

  const body = {
    amount: {
      value: "990.00",
      currency: "RUB"
    },
    confirmation: {
      type: "redirect",
      return_url: "https://art-g.art"
    },
    capture: true,
    description: "Подписка"
  };

  const response = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${auth}`,
      "Idempotence-Key": Date.now().toString()
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  res.status(200).json({
    url: data.confirmation.confirmation_url
  });
}
