export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { price, orderId } = req.body;

  // Notionの動画視聴ページURL（1本目）
  const notionURL = "https://kinatan.notion.site/your-first-video-url";

  try {
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: price,
        price_currency: 'jpy',
        pay_currency: 'usdt',
        order_id: orderId,
        success_url: notionURL,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(400).json({ error: data.message || 'Failed to create invoice' });
    }

    return res.status(200).json({ invoice_url: data.invoice_url });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
