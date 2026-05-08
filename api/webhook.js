import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "ok" });
  }

  try {
    const event = req.body;

    console.log("Webhook:", event);

    // Только успешная оплата
    if (
      event.event === "payment.succeeded" &&
      event.object?.status === "succeeded"
    ) {
      const payment = event.object;

      const metadata = payment.metadata || {};

      const email = metadata.email || "";
      const plan = metadata.plan || "";
      const paymentId = payment.id || "";

      // payment_method_id
      let paymentMethodId = "";

      if (payment.payment_method?.id) {
        paymentMethodId = payment.payment_method.id;
      }

      // URL из Vercel ENV
      const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

      if (!GOOGLE_SCRIPT_URL) {
        throw new Error("GOOGLE_SCRIPT_URL not found");
      }

      // Отправка в Google Sheets
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          plan,
          payment_id: paymentId,
          payment_method_id: paymentMethodId,
          status: "active",
        }),
      });

      const text = await response.text();

      console.log("Sheets response:", text);
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Webhook error:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}
