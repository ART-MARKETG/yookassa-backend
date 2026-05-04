export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body;

    if (body.event === "payment.succeeded") {
      const payment = body.object;

      const paymentId = payment.id;
      const status = payment.status;
      const paymentMethodId = payment.payment_method.id;

      const email =
        payment?.receipt?.customer?.email || "unknown";

      console.log("=================================");
      console.log("STATUS:", status);
      console.log("PAYMENT ID:", paymentId);
      console.log("PAYMENT METHOD ID:", paymentMethodId);
      console.log("USER:", email);
      console.log("=================================");
    }

    res.status(200).json({ received: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
