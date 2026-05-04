import os
import telebot
import requests

# --- НАСТРОЙКИ ---
# Вставляем токены сюда (или через переменные окружения на сервере)
TELEGRAM_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN') 
POLZA_API_KEY = os.getenv('POLZA_API_KEY')

# Если запустили локально, раскомментируйте строки ниже и вставьте свои ключи:
# TELEGRAM_TOKEN = 'ВАШ_ТОКЕН_ОТ_BOTFATHER'
# POLZA_API_KEY = 'ВАШ_КЛЮЧ_ОТ_POLZA'

bot = telebot.TeleBot(TELEGRAM_TOKEN)

# Системный промпт (тот же, что на сайте)
SYSTEM_PROMPT = """Ты — эксперт-нутрициолог помощник сервиса БАД-Master 🌿.
Отвечай кратко, по делу, на русском.
Всегда в конце добавляй: "⚠️ Перед приёмом проконсультируйтесь с врачом."
Если просят составить план — предлагай открыть сайт для полного расписания."""

@bot.message_handler(commands=['start'])
def send_welcome(message):
    text = """🌿 Привет! Я твой помощник по здоровью.
    
Я знаю всё о витаминах, минералах и добавках.
Спроси меня:
• "Что пить для иммунитета?"
• "Можно ли магний с железом?"
• "Какие добавки для сна?"

👇 Или нажми кнопку ниже, чтобы составить полный план на сайте!"""
    
    markup = telebot.types.InlineKeyboardMarkup()
    btn = telebot.types.InlineKeyboardButton("📋 Составить план на сайте", url="https://bad-master.vercel.app")
    markup.add(btn)
    
    bot.reply_to(message, text, reply_markup=markup)

@bot.message_handler(content_types=['text'])
def handle_text(message):
    # Показываем, что бот печатает
    bot.send_chat_action(message.chat.id, 'typing')
    
    try:
        # Запрос к Polza.ai
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
                'max_tokens': 500
            }
        )
        
        data = response.json()
        answer = data['choices'][0]['message']['content']
        
        # Добавляем кнопку на сайт в каждый ответ
        markup = telebot.types.InlineKeyboardMarkup()
        btn = telebot.types.InlineKeyboardButton("🌿 Открыть БАД-Master", url="https://bad-master.vercel.app")
        markup.add(btn)
        
        bot.reply_to(message, answer, reply_markup=markup)
        
    except Exception as e:
        bot.reply_to(message, "⚠️ Ошибка связи с мозгом. Попробуйте позже.")
        print(e)

# Запуск
print("Бот запущен...")
bot.infinity_polling()
