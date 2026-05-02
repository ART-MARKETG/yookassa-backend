export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const event = req.body;

    console.log("Webhook пришёл:", JSON.stringify(event, null, 2));

    if (event.event === "payment.succeeded") {
      const payment = event.object;

      console.log("PAYMENT ID:", payment.id);
      console.log("PAYMENT METHOD ID:", payment.payment_method?.id);
    }

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
}
