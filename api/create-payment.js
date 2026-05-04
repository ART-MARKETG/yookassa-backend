export default async function handler(req, res) {

  // ✅ CORS (КРИТИЧНО)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan } = req.body;

    let amount = '990.00';

    if (plan === 'pro') amount = '1990.00';
    if (plan === 'vip') amount = '4990.00';

    const auth = Buffer.from(
      `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`
    ).toString('base64');

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
        'Idempotence-Key': Math.random().toString()
      },
      body: JSON.stringify({
        amount: {
          value: amount,
          currency: 'RUB'
        },
        confirmation: {
          type: 'redirect',
          return_url: 'https://art-g.art'
        },
        capture: true,
        description: `Подписка ${plan}`
      })
    });

    const data = await response.json();

    return res.status(200).json({
      confirmation_url: data.confirmation.confirmation_url
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'server error' });
  }
}
