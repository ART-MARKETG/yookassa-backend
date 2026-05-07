import YooCheckout from "@a2seven/yoo-checkout";

const checkout = new YooCheckout({
  shopId: process.env.YOOKASSA_SHOP_ID,
  secretKey: process.env.YOOKASSA_SECRET_KEY
});

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

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

    }, Math.random().toString(36).substring(2, 15));

    return res.status(200).json({
      confirmation_url: payment.confirmation.confirmation_url
    });

  } catch (e) {

    return res.status(500).json({
      error: e.message
    });

  }
}
