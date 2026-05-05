import telebot
import requests

# === НАСТРОЙКИ (Ваши ключи уже вставлены) ===
TELEGRAM_TOKEN = "8639726243:AAFlclplxzOR2DFMyVmb47SB_lAmLcv6Yc8"
POLZA_API_KEY = "pza_nqIev9iYwJYpLB2WTJ_bUPRl5S43nISM"
SITE_URL = "https://bad-master.vercel.app"  # Потом заменим на vita.care / zhivilegko.ru

# Инициализация бота
bot = telebot.TeleBot(TELEGRAM_TOKEN)

# Системный промпт для ИИ
SYSTEM_PROMPT = """Ты — ЖивиЛегко, дружелюбный помощник по натуральному здоровью от бренда VITA.
Отвечай кратко, тепло и по делу на русском языке.
Всегда в конце добавляй: "⚠️ Перед приёмом проконсультируйтесь с врачом."
Если просят составить план — мягко предлагай открыть сайт для полного расписания и трекера."""

@bot.message_handler(commands=['start'])
def send_welcome(message):
    text = f"""🌿 Привет! Я ЖивиЛегко — твой советник от VITA.

Я знаю всё о витаминах, минералах и добавках.
Спроси меня:
• "Что пить для иммунитета?"
• "Можно ли магний с железом?"
• "Какие добавки для сна?"

👇 Или нажми кнопку, чтобы составить полный план на сайте!"""

    markup = telebot.types.InlineKeyboardMarkup()
    btn = telebot.types.InlineKeyboardButton("📋 Составить план на сайте", url=SITE_URL)
    markup.add(btn)

    bot.reply_to(message, text, reply_markup=markup)

@bot.message_handler(content_types=['text'])
def handle_text(message):
    bot.send_chat_action(message.chat.id, 'typing')

    try:
        response = requests.post(
            'https://api.polza.ai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {POLZA_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': message.text}
                ],
                'max_tokens': 600,
                'temperature': 0.3
            }
        )

        data = response.json()
        if 'choices' in data and len(data['choices']) > 0:
            answer = data['choices'][0]['message']['content']
        else:
            answer = "⚠️ Не удалось получить ответ от ИИ. Попробуйте позже."

        markup = telebot.types.InlineKeyboardMarkup()
        btn = telebot.types.InlineKeyboardButton("🌿 Открыть VITA | ЖивиЛегко", url=SITE_URL)
        markup.add(btn)

        bot.reply_to(message, answer, reply_markup=markup)

    except Exception as e:
        print(f"Ошибка: {e}")
        bot.reply_to(message, "⚠️ Ошибка связи. Проверьте соединение или попробуйте позже.")

if __name__ == '__main__':
    print("✅ Бот ЖивиЛегко запущен!")
    bot.infinity_polling()
