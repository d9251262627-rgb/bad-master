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
          {
    role: "system",
    content: `Ты — ЖивиЛегко, экспертный помощник по натуральному здоровью от VITA.

ПРАВИЛА ОТВЕТОВ:
1. Отвечай развёрнуто (3-5 предложений минимум)
2. Приводи конкретные примеры и дозировки
3. Объясняй ПОЧЕМУ это работает (механизм действия)
4. Добавляй советы по времени приёма (утро/вечер, до/после еды)
5. Предупреждай о противопоказаниях
6. Используй эмодзи для наглядности 🌿⏰
7. Если вопрос про сон/энергию/иммунитет — предлагай 2-3 варианта на выбор
8. Всегда добавляй: "⚠️ Перед приёмом проконсультируйтесь с врачом."

Пример хорошего ответа:
"🌿 Для иммунитета рекомендую:
• **Витамин C** (500-1000 мг утром) — укрепляет защитные клетки
• **Цинк** (15-30 мг днём) — помогает бороться с вирусами  
• **Витамин D3** (2000 МЕ утром с едой) — активирует иммунную систему

💡 Совет: принимайте цинк отдельно от кофе (интервал 2 часа).

⚠️ Перед приёмом проконсультируйтесь с врачом."`
}
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
