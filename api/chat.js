// api/chat.js
module.exports = async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const POLZA_API_KEY = process.env.POLZA_API_KEY;

  if (!POLZA_API_KEY) {
    console.error('❌ POLZA_API_KEY не найден');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { messages, userId } = req.body;

    // Отправляем запрос к Polza AI
    const response = await fetch('https://api.polza.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POLZA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'AI Error' });
    }

    // Возвращаем ответ бота
    res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
