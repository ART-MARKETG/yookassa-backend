export default async function handler(req, res) {
  try {
    const body = req.body;

    // 👉 проверяем что это успешная оплата
    if (body.event === 'payment.succeeded') {
      const payment = body.object;

      const status = payment.status;
      const paymentId = payment.id;
      const paymentMethodId = payment.payment_method.id;

      // если ты добавишь email позже
      const userId = payment.metadata?.userId || 'unknown';

      // 🔥 ЛОГИ — ЭТО САМОЕ ВАЖНОЕ СЕЙЧАС
      console.log('======================');
      console.log('STATUS:', status);
      console.log('PAYMENT ID:', paymentId);
      console.log('PAYMENT METHOD ID:', paymentMethodId);
      console.log('USER:', userId);
      console.log('======================');

      // 👉 тут потом будем сохранять в таблицу
    }

    res.status(200).send('ok');

  } catch (error) {
    console.error('WEBHOOK ERROR:', error);
    res.status(500).send('error');
  }
}
