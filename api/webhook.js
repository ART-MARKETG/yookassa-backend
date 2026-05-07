export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    const body = req.body;

    console.log("Webhook:", body);

    // Только успешные оплаты
    if (body.event !== "payment.succeeded") {

      return res.status(200).json({
        ignored: true
      });
    }

    const payment = body.object;

    const email = payment.metadata.email;

    const plan = payment.metadata.plan;

    const paymentId = payment.id;

    const paymentMethodId =
      payment.payment_method.id;

    const today =
      new Date().toISOString().split("T")[0];

    const GOOGLE_SCRIPT_URL =
      process.env.GOOGLE_SCRIPT_URL;

    // Проверяем дубли
    const checkResponse = await fetch(
      `${GOOGLE_SCRIPT_URL}?payment_id=${paymentId}`
    );

    const checkData =
      await checkResponse.json();

    // Уже существует
    if (checkData.exists) {

      console.log("Duplicate payment");

      return res.status(200).json({
        duplicate: true
      });
    }

    // Сохраняем
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        payment_id: paymentId,
        payment_method_id: paymentMethodId,
        plan,
        start_date: today,
        last_payment: today,
        status: "active"
      })
    });

    return res.status(200).json({
      success: true
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
}
