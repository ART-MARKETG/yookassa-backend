export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { email, amount, plan } = req.body;

    // YooKassa credentials
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    // Google Script URL
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    // auth
    const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");

    // payment request
    const paymentData = {
      amount: {
        value: amount,
        currency: "RUB",
      },

      capture: true,

      save_payment_method: true,

      confirmation: {
        type: "redirect",
        return_url: "https://art-g.art",
      },

      description: `Подписка ${plan}`,

      receipt: {
        customer: {
          email,
        },

        items: [
          {
            description: `Подписка ${plan}`,
            quantity: "1.00",

            amount: {
              value: amount,
              currency: "RUB",
            },

            vat_code: 1,

            payment_mode: "full_prepayment",

            payment_subject: "service",
          },
        ],
      },
    };

    // create payment
    const yooResponse = await fetch(
      "https://api.yookassa.ru/v3/payments",
      {
        method: "POST",

        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          "Idempotence-Key": crypto.randomUUID(),
        },

        body: JSON.stringify(paymentData),
      }
    );

    const payment = await yooResponse.json();

    // error check
    if (!payment.confirmation) {
      return res.status(500).json({
        success: false,
        payment,
      });
    }

    // save to google sheets
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          payment_method_id: "pending",
          plan,
          start_date: new Date().toISOString().split("T")[0],
          last_payment: new Date().toISOString().split("T")[0],
          status: "pending",
        }),
      });
    } catch (googleError) {
      console.log("Google Sheets Error:", googleError);
    }

    // return payment url
    return res.status(200).json({
      success: true,
      confirmation_url: payment.confirmation.confirmation_url,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
