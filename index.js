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

if (/\//) {
    bot.onText(/\/info/, (msg) => {
        bot.sendMessage(msg.chat.id, "Привет! Я информатор. Это информационное сообщение, которое должно дать вам полезную информацию.");
    });
}
if (/\//){
    bot.onText(/\//, (msg) => {
        if (/help/i.test(msg.text)) {
            bot.sendMessage(msg.chat.id, "Привет! Я помощник. Это сообщение помощи, которое должно помочь вам в использовании бота. Список доступных команд: " +
                " /help " +
                " /info");
        }
    });
}
if (/\//){
    if (/\/start/) {
        bot.onText(/\/start/, (msg) => {
            bot.sendMessage(msg.chat.id, "Здравствуйте! Вы очень важны для нас. Администраторы будут с вами связываться в ближайшее время.", {}).then(r => 0);
        }) ;
    }
    else {
        bot.sendMessage(msg.chat.id, "Введите /help, чтобы получить список доступных команд.");
    }
}

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (chatId == admin && msg.reply_to_message) { // если сообщение пришло от админа и это ответ на сообщение
        if (msg.voice) { // если пришло голосовое сообщение
            bot.sendVoice(msg.reply_to_message.forward_from.id, msg.voice.file_id);
        } else if (msg.photo) { // если пришло фото
            bot.sendPhoto(msg.reply_to_message.forward_from.id, msg.photo[0].file_id);
        } else if (msg.document) { // если пришел документ
            bot.sendDocument(msg.reply_to_message.forward_from.id, msg.document.file_id);
        } else { // если не голосовое сообщение, отправляем текстовый ответ
            bot.sendMessage(msg.reply_to_message.forward_from.id, msg.text);
        }
    } else if (chatId != admin) {
        // пересылаем сообщение админу
        bot.forwardMessage(admin, chatId, msg.message_id);
    }
});


bot.on('polling_error', (error) => {
    console.log(error);
});
