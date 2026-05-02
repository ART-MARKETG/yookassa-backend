export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const event = req.body;

    console.log("Webhook пришёл:", JSON.stringify(event, null, 2));

    if (event.event === "payment.succeeded") {
      const payment = event.object;

      const paymentId = payment.id;
      const paymentMethodId = payment.payment_method.id;

      const userId = payment.metadata?.user_id;
      const email = payment.metadata?.email;
      const plan = payment.metadata?.plan;

      const amount = payment.amount.value;
      const currency = payment.amount.currency;

      console.log("====== ОПЛАТА ======");
      console.log("USER ID:", userId);
      console.log("EMAIL:", email);
      console.log("PLAN:", plan);

      console.log("PAYMENT ID:", paymentId);
      console.log("PAYMENT METHOD ID:", paymentMethodId);
      console.log("AMOUNT:", amount, currency);
    }

    res.status(200).end();

  } catch (e) {
    console.error("WEBHOOK ERROR:", e);
    res.status(500).end();
  }
}
