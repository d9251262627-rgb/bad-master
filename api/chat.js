export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, userId } = req.body;
  const POLZA_API_KEY = process.env.POLZA_API_KEY;
  
  if (!POLZA_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.polza.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POLZA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Ты — эксперт-нутрициолог помощник сервиса БАД-Master 🌿. Отвечай кратко, на русском. Всегда добавляй: "⚠️ Перед приёмом проконсультируйтесь с врачом".`
          },
          ...messages
        ],
        max_tokens: 600,
        temperature: 0.3
      })
    });

    const data = await response.json();
    if (data.choices?.[0]?.message) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: 'AI service error' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
