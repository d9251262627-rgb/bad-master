export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const POLZA_API_KEY = process.env.POLZA_API_KEY;
  if (!POLZA_API_KEY) {
    console.error('❌ POLZA_API_KEY не найден в переменных окружения');
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { messages } = req.body;

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
            content: "Ты — ЖивиЛегко, помощник по здоровью от VITA. Отвечай кратко, тепло на русском. Всегда добавляй: '️ Перед приёмом проконсультируйтесь с врачом.'"
          },
          ...(messages || [])
        ],
        max_tokens: 600,
        temperature: 0.3
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(' Ошибка Polza API:', data);
      return res.status(response.status).json({ error: data.error?.message || 'AI service error' });
    }

    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error(' Ошибка сервера:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
