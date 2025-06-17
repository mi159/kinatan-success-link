export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  console.log("✅ handler 関数が呼び出された！");
  console.log("📌 APIエンドポイントに到達した！");

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let data;
  try {
    data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    console.error("❌ JSONパース失敗:", e);
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { price, orderId, pay_currency } = data;
  console.log("📥 リクエスト受信:", { price, orderId, pay_currency });

  if (!price || !orderId || !pay_currency) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const notionURL = "https://mountain-almond-412.notion.site/Kinatan-Streaming-Page-212461c14fb780fbab86e48133c77c6a?source=copy_link";

  try {
    console.log("🛠️ handler() 入ったよ！");
    console.log("🔑 使用APIキー:", process.env.NOWPAYMENTS_API_KEY?.slice(0, 5) + "****");
    console.log("📤 送信ボディ:", {
      price_amount: price,
      price_currency: 'jpy',
      pay_currency,
      order_id: orderId,
      success_url: notionURL,
    });

    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: price,
        price_currency: 'jpy',
        pay_currency,
        order_id: orderId,
        success_url: notionURL,
        callback_url: 'https://あなたのドメイン/api/nowpayments-ipn',
      }),
      cache: 'no-store',
    });

    console.log("📡 APIレスポンスステータス:", response.status);

    const text = await response.text();
    console.log("📦 生レスポンステキスト:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("⚠️ JSONパース失敗:", e);
      return res.status(500).json({ error: 'Invalid JSON response from NowPayments' });
    }

    if (!response.ok) {
      return res.status(400).json({ error: data.message || 'Failed to create invoice' });
    }

    return res.status(200).json({ invoice_url: data.invoice_url });
  } catch (err) {
    console.error("❌ 例外発生:", err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
