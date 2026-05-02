export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  try {
    const { paymentMethodId, amount } = req.body;

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': Math.random().toString(36),
        'Authorization': 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64')
      },
      body: JSON.stringify({
        amount: {
          value: amount,
          currency: 'RUB'
        },
        payment_method_id: paymentMethodId,
        capture: true,
        description: 'Автосписание'
      })
    });

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Charge failed' });
  }
}
