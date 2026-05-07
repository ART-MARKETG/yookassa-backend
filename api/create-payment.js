import YooCheckout from "@a2seven/yoo-checkout";

export default async function handler(req, res) {

  try {

    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    if (!process.env.YOOKASSA_SHOP_ID) {
      return res.status(500).json({
        error: "NO_SHOP_ID"
      });
    }

    if (!process.env.YOOKASSA_SECRET_KEY) {
      return res.status(500).json({
        error: "NO_SECRET_KEY"
      });
    }

    const checkout = new YooCheckout({
      shopId: process.env.YOOKASSA_SHOP_ID,
      secretKey: process.env.YOOKASSA_SECRET_KEY
    });

    const payment = await checkout.createPayment({
      amount: {
        value: "100.00",
        currency: "RUB"
      },

      payment_method_data: {
        type: "bank_card"
      },

      confirmation: {
        type: "redirect",
        return_url: "https://google.com"
      },

      capture: true,
      description: "Test payment"

    });

    return res.status(200).json({
      success: true,
      payment
    });

  } catch (e) {

    return res.status(500).json({
      error: e.message,
      stack: e.stack
    });

  }
}
