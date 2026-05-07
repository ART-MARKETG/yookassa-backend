export default async function handler(req, res) {
  try {

    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    return res.status(200).json({
      success: true,
      message: "charge-saved works"
    });

  } catch (e) {

    return res.status(500).json({
      error: e.message
    });

  }
}
