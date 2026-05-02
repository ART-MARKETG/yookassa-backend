export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const event = req.body.event;
    const payment = req.body.object;

    if (event === 'payment.succeeded') {

      const userId = payment.metadata.user_id;
      const paymentMethodId = payment.payment_method?.id;

      console.log('Оплата успешна');
      console.log('User:', userId);
      console.log('PaymentMethod:', paymentMethodId);

      // 🔥 СЮДА ТЫ ПОТОМ ПОДКЛЮЧИШЬ БАЗУ
      // пример:
      // await savePaymentMethod(userId, paymentMethodId);

    }

    res.status(200).end();

  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
}
