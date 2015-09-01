var TelegramBot = require('./bot');
var config = require('./config');

var ForceReply = require('./markup/ForceReply');
var ReplyKeyboardHide = require('./markup/ReplyKeyboardHide');
var ReplyKeyboardMarkup = require('./markup/ReplyKeyboardMarkup');


module.exports = {
    handler: BotHandler
};

function BotHandler(messageObj) {
    TelegramBot.handle(messageObj);
}

TelegramBot.setToken(config.botToken);

TelegramBot.on('/start', onStart);

TelegramBot.on('/help', onHelp);

TelegramBot.on('/connect', onConnect);

TelegramBot.on('/list', onList);

TelegramBot.on('/drop_connect', onDropConnect);

TelegramBot.on('/test', onTest);

TelegramBot.on('message', onMessage);


/**
 * @param {Message} message
 */
function onStart(message) {
    var text = 'Добро пожаловать!\n\nДанный бот поможет Вам связать группы воедино. Любые сообщения (фото, видео, документы и т. п.), отправленные из Вашей группы, отправятся в другие привязанные группы.' +
        '\n\nВсе очень просто!\nЧтобы связать две группы, просто наберите /connect. Полученный код отправьте в другую группу. Готово!' +
        '\n\nЧтобы подробнее разобраться в возможностях Бота, отправьте /help.';
    TelegramBot.sendText(message.getChat().id, text);
    console.log('/start');
}


/**
 * @param {Message} message
 */
function onHelp(message) {
    var text = 'Данная инструкция поможет Вам разобраться в возможностях этого Бота.\n\n' +
        'Итак. Максимальное количество групп, которые можно связывать в одну: 20.\n' +
        'Администратором бота в группе считается тот человек, который добавил бота в группу.\n\n' +
        'Администратор бота в группе имеет следующие права:\n' +
        '1) ';
    TelegramBot.sendText(message.getChat().id, text);
    console.log('/help');
}


/**
 * @param {Message} message
 */
function onConnect(message) {
    console.log('/connect');
}


/**
 * @param {Message} message
 */
function onList(message) {
    console.log('/list');
}


/**
 * @param {Message} message
 */
function onDropConnect(message) {
    console.log('/drop_connect');
}


/**
 * @param {Message} message
 */
function onTest(message) {
    var sender = TelegramBot.getSender(message.getChat().id, message);
    if (sender && sender.type === 'text') {
        var replyMarkup = new ForceReply();
        sender.send(false, false, replyMarkup);
        console.log('Sent');
    }
    console.log('/test');
}


/**
 * @param {Message} message
 */
function onMessage(message) {
    console.log('message');
}