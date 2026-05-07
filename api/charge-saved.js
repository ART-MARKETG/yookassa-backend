import YooKassa from "yookassa";

const yooKassa = new YooKassa({
  shopId: process.env.SHOP_ID,
  secretKey: process.env.SECRET_KEY,
});

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed",
      });
    }

    const { payment_method_id, amount } = req.body;

    if (!payment_method_id) {
      return res.status(400).json({
        error: "payment_method_id required",
      });
    }

    const payment = await yooKassa.createPayment(
      {
        amount: {
          value: amount || "100.00",
          currency: "RUB",
        },

        payment_method_id,

        capture: true,

        description: "Recurring subscription payment",
      },
      Math.random().toString(36).substring(2, 15)
    );

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}
