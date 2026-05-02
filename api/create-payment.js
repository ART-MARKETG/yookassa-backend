export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  try {
    const { amount, userId } = req.body;

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
        confirmation: {
          type: 'redirect',
          return_url: 'https://your-site.com/success'
        },
        capture: true,
        description: 'Подписка',
        save_payment_method: true, // 🔥 ВАЖНО
        metadata: {
          user_id: userId
        }
      })
    });

    const data = await response.json();

    return res.status(200).json({
      confirmation_url: data.confirmation.confirmation_url
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Payment creation failed' });
  }
}
