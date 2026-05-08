import axios from "axios";

export default async function handler(req, res) {

  try {

    const body = req.body;

    console.log("WEBHOOK:", body);

    if (body.event !== "payment.succeeded") {
      return res.status(200).end();
    }

    const payment = body.object;

    const email =
      payment.metadata?.email || "";

    const plan =
      payment.metadata?.plan || "";

    const paymentId =
      payment.id;

    const paymentMethodId =
      payment.payment_method?.id || "";

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    // Проверка дублей
    const checkResponse =
      await axios.get(
        `${process.env.GOOGLE_SCRIPT_URL}?payment_id=${paymentId}`
      );

    if (checkResponse.data.exists) {

      console.log("Duplicate payment");

      return res.status(200).json({
        duplicate: true
      });
    }

    // Запись в таблицу
    await axios.post(
      process.env.GOOGLE_SCRIPT_URL,
      {
        email,
        payment_id: paymentId,
        payment_method_id: paymentMethodId,
        plan,
        start_date: today,
        last_payment: today,
        status: "active"
      }
    );

    return res.status(200).json({
      success: true
    });

  } catch (error) {

    console.log(error.message);

    return res.status(500).json({
      error: error.message
    });
  }
}
