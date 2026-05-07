import YooCheckout from "@a2seven/yoo-checkout";

const checkout = new YooCheckout({
  shopId: process.env.YOOKASSA_SHOP_ID,
  secretKey: process.env.YOOKASSA_SECRET_KEY
});

export default async function handler(req, res) {

  try {

    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    const {
      paymentMethodId,
      amount
    } = req.body;

    if (!paymentMethodId || !amount) {
      return res.status(400).json({
        error: "paymentMethodId and amount required"
      });
    }

    const payment = await checkout.createPayment({
      amount: {
        value: amount,
        currency: "RUB"
      },

      payment_method_id: paymentMethodId,

      capture: true,

      description: "Recurring subscription payment"
    });

    return res.status(200).json({
      success: true,
      payment
    });

  } catch (e) {

    return res.status(500).json({
      error: e.message
    });

  }
}
