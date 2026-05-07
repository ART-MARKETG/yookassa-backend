export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const body = req.body;

    console.log("Webhook:", body);

    const event = body.event;
    const payment = body.object;

    // ТОЛЬКО успешная оплата
    if (event !== "payment.succeeded") {
      return res.status(200).end();
    }

    const email = payment.metadata.email;
    const plan = payment.metadata.plan;

    // Отправка в Google Sheets
    await fetch(process.env.GOOGLE_SCRIPT_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,

        payment_id: payment.id,

        payment_method_id:
          payment.payment_method?.id || "unknown",

        plan,

        start_date: new Date()
          .toISOString()
          .split("T")[0],

        last_payment: new Date()
          .toISOString()
          .split("T")[0],

        status: "active",
      }),
    });

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}
