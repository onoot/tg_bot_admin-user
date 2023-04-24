const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
require('dotenv').config();

const token = process.env.Telegram_bot_token;
const admin = process.env.Admin;

const bot = new TelegramBot(token, { polling: true });

const commands = {
    help: 'Показать сообщение помощи',
    info: 'Показать информационное сообщение'
};

bot.setMyCommands([
    { command: '/help', description: commands.help },
    { command: '/info', description: commands.info },
]);

// Обработка текстовых сообщений
bot.on('text', (msg) => {
    const chatId = msg.chat.id;

    if (chatId == admin && msg.reply_to_message) {
        // Если сообщение от админа и это ответ на сообщение
        bot.sendMessage(msg.reply_to_message.forward_from.id, msg.text);
    } else if (chatId != admin) {
        // Если сообщение от обычного пользователя, пересылаем его админу
        bot.forwardMessage(admin, chatId, msg.message_id);
    }

    if (msg.text.startsWith('/help')) {
        // Обработка команды /help
        bot.sendMessage(chatId, "Привет! Я помощник. Это сообщение помощи, которое должно помочь вам в использовании бота. Список доступных команд: " +
            " /help " +
            " /info");
    }else if (msg.text.startsWith('/info')) {
        // Обработка команды /info
        bot.sendMessage(chatId, "Привет! Я информатор. Это информационное сообщение, которое должно дать вам полезную информацию.");

    }else if (msg.text.startsWith('/start')) {
        // Обработка команды /start
        bot.sendMessage(chatId, "Здравствуйте! Вы очень важны для нас. Администраторы с вами свяжутся в ближайшее время.");

    }
});

// Обработка голосовых, файловых и изображений сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (chatId == admin && msg.reply_to_message) {
        // Если сообщение от админа и это ответ на сообщение
        switch (msg.reply_to_message.forward_from.type) {
            case 'voice':
                if (msg.voice) {
                    // Если это голосовое сообщение
                    bot.sendVoice(msg.reply_to_message.forward_from.id, msg.voice.file_id);
                } else {
                    bot.sendMessage(admin, 'Не удалось обработать голосовое сообщение');
                }
                break;
            case 'photo':
                if (msg.photo && msg.photo.length) {
                    // Если это сообщение с изображением
                    const photo = msg.photo[msg.photo.length - 1];
                    bot.sendPhoto(msg.reply_to_message.forward_from.id, photo.file_id);
                } else {
                    bot.sendMessage(admin, 'Не удалось обработать сообщение с изображением');
                }
                break;
            case 'document':
                if (msg.document) {
                    // Если это сообщение с файлом
                    bot.sendDocument(msg.reply_to_message.forward_from.id, msg.document.file_id);
                } else {
                    bot.sendMessage(admin, 'Не удалось обработать сообщение с файлом');
                }
                break;
        }
    } else if (chatId != admin) {
        // Если сообщение от обычного пользователя, пересылаем его админу
        if (msg.voice) {
            // Если это голосовое сообщение
            bot.forwardMessage(admin, chatId, msg.message_id);
        } else if (msg.photo && msg.photo.length) {
            // Если это сообщение с изображением
            const photo = msg.photo[msg.photo.length - 1];
            bot.sendPhoto(admin, photo.file_id);
        } else if (msg.document) {
            // Если это сообщение с файлом
            bot.sendDocument(admin, msg.document.file_id);
        } else {
            // Если это обычное текстовое сообщение, пересылаем его админу
            bot.forwardMessage(admin, chatId, msg.message_id);
        }
    }
});

bot.on('polling_error', (error) => {
    console.log(error);
});
