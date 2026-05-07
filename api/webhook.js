export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    console.log("Webhook:", req.body);

    return res.status(200).json({
      success: true
    });

  } catch (e) {

    return res.status(500).json({
      error: e.message
    });

  }
}
