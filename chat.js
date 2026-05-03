// api/chat.js — ПРОКСИ-СЕРВЕР ДЛЯ ПОЛЗА.АИ
// Этот файл должен лежать в папке api/ рядом с index.html

export default async function handler(req, res) {
  // Разрешаем только POST-запросы (безопасность)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, userId } = req.body;
  
  // API-ключ берём из настроек сервера (НЕ из кода!)
  const POLZA_API_KEY = process.env.POLZA_API_KEY;
  
  if (!POLZA_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Отправляем запрос к Polza.ai
    const response = await fetch('https://api.polza.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POLZA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Модель ИИ (можно менять)
        messages: [
          {
            role: "system",
            content: `Ты — эксперт-нутрициолог помощник сервиса БАД-Master 🌿.
Твоя задача: помогать пользователям подбирать натуральные добавки.
Всегда добавляй дисклеймер: "⚠️ Перед приёмом проконсультируйтесь с врачом".
Отвечай кратко, на русском.`
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
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}