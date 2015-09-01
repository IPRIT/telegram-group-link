var TelegramBot = require('./bot');
var config = require('./config');

TelegramBot.setToken(config.botToken);

var ForceReply = require('./markup/ForceReply');
var ReplyKeyboardHide = require('./markup/ReplyKeyboardHide');
var ReplyKeyboardMarkup = require('./markup/ReplyKeyboardMarkup');


module.exports = {
    handler: BotHandler
};

function BotHandler(messageObj) {
    TelegramBot.handle(messageObj);
}

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
    var text = 'Данная инструкция поможет Вам детально разобраться в возможностях этого Бота.\n\n' +
        'Итак. Максимальное количество групп, которые можно связывать в одну: 20.\n' +
        'Администратором бота в группе считается тот человек, который добавил бота в группу.\n\n' +
        'Администратор бота в группе имеет следующие возможности:\n' +
        '1) Получать одноразовый код для соединения с другой группой.\n' +
        '2) Удалять соединение с другой группой.\n' +
        '3) Вставлять полученный из другой группы код в текущую группу для соединения.\n\n' +
        'Группы можно соединить как одному человеку, так и двум.\nПример: ' +
        'Вы добавили Бота в группу A — теперь вы являетесь администратором Бота. Вы можете получить код для соединения с помощью команды /connect и отправить другому человеку из группы Б, который соединит две группы А и Б. ' +
        'Этот другой человек должен быть администратором бота в своей группе Б.\nАдминистраторы ботов в группах А и Б могут удалять соединение друг с другом, т. е. администратор группы А может удалить соединение с группой Б также, как и наоборот.\n' +
        'Удаление соединения делается с помощью команды /drop_connect.\n\n' +
        'Все участники групп могут просматривать соединения с другими группами с помощью команды /list.\n\n' +
        'Коротко о командах:\n' +
        '/connect — получить одноразовый код для соединения с другой группой. Команда действует только для администратора. Код видят все, так как он одноразовый*.\n\n' +
        '/drop_connect — удалить соединение с выбранной группой.\n\n' +
        '/list — посмотреть список групп, которые находятся в одной связке.\n\n' +
        '/help — получить эту справку.\n\n' +
        '* — если в Вашей уютной группе завелся редиска, который скопировал код и связал с другой нежелательной Вам группой быстрее Вас, — не переживайте! Вы всегда можете удалить это соединение (и редиску) и получить новый код для связывания.\n\n' +
        'За исходным кодом можете следить здесь: https://github.com/IPRIT/telegram-group-link\nКонтрибуция приветствуется!\n' +
        'Если возникли предложения или вопросы, вы всегда можете обратиться ко мне (@belov).';
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
    if (message.messageType === 'new_chat_participant'
        && message.new_chat_participant.username === config.botNickname) {
        return onBotJoin(message);
    }
    if (message.messageType === 'left_chat_participant'
        && message.left_chat_participant.username === config.botNickname) {
        return onBotLeave(message);
    }
    console.log('message');
}


/**
 * @param {Message} message
 */
function onBotJoin(message) {
    // добавляем чат в базу данных
    // устанавливаем администратора
    if (message.isGroupMessage) {
        onStart(message);
    }
}


/**
 * @param {Message} message
 */
function onBotLeave(message) {
    // удаляем чат из базы данных
    // удаляем все связи
}