export default async function handler(req, res) {
  // Проверяем метод
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const event = req.body;

    // Лог всего события (на всякий случай)
    console.log("=== WEBHOOK EVENT ===");
    console.log(JSON.stringify(event, null, 2));

    const payment = event.object;

    // Основная информация о платеже
    console.log("=== ПЛАТЕЖ ===");
    console.log("PAYMENT ID:", payment?.id);
    console.log("STATUS:", payment?.status);
    console.log("AMOUNT:", payment?.amount?.value);

    // 🔥 САМОЕ ВАЖНОЕ
    console.log("=== СПОСОБ ОПЛАТЫ ===");
    console.log("PAYMENT METHOD ID:", payment?.payment_method?.id);

    // Дополнительно (полезно)
    console.log("PAID:", payment?.paid);
    console.log("CREATED AT:", payment?.created_at);

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("❌ Ошибка webhook:", error);
    return res.status(500).json({ error: "Webhook error" });
  }
}
