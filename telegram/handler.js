/*
 sudo rm /data/db/mongod.lock
 sudo mongod --dbpath /data/db --repair
 sudo chown mongodb /data/db/*
 sudo mongod --bind_ip=$IP --nojournal
 */


var TelegramBot = require('./bot');
var config = require('./config');
var Controller = require('./controller');
var chatsController = new Controller();

TelegramBot.setToken(config.botToken);

var ForceReply = require('./markup/ForceReply');
var ReplyKeyboardHide = require('./markup/ReplyKeyboardHide');
var ReplyKeyboardMarkup = require('./markup/ReplyKeyboardMarkup');


module.exports = {
    handler: BotHandler
};

function BotHandler(messageObj) {
    console.log(messageObj);
    TelegramBot.handle(messageObj);
}

TelegramBot.on('/start', onStart);

TelegramBot.on('/help', onHelp);

TelegramBot.on('/connect', onConnect);

TelegramBot.on('/list', onList);

TelegramBot.on('/drop_connect', onDropConnect);

TelegramBot.on('/other_languages', onSelectLang);

TelegramBot.on('message', onMessage);


/**
 * @param {Message} message
 */
function onStart(message) {
    var text = 'Добро пожаловать!\n\nДанный бот поможет Вам связать группы воедино. Любые сообщения (фото, видео, документы и т. п.), отправленные из Вашей группы, отправятся в другие привязанные группы.' +
        '\n\nВсе очень просто!\nЧтобы связать две группы, просто наберите /connect. Полученный код отправьте в другую группу. Готово!' +
        '\n\nЧтобы подробнее разобраться в возможностях Бота, отправьте /help.' +
        '\n\nПроголосуйте за бота, чтобы улучшить его функциональность и стабильность, перейдя по этой ссылке: https://telegram.me/storebot?start=group_link_bot' +
        '\n\nВы можете подписаться на канал, чтобы получать обновления о новых возможностях бота: https://telegram.me/group_linker';
    TelegramBot.sendText(message.getChat().id, text);
    console.log('/start');
}


/**
 * @param {Message} message
 */
function onHelp(message) {
    var text = 'Данная инструкция поможет Вам детально разобраться в возможностях этого Бота.\n\n' +
        'Итак. Максимальное количество групп, которые можно связывать в одну: 1000.\n' +
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
    if (!message.isGroupMessage) {
        TelegramBot.sendText(message.getChat().id, text);
        console.log('/help');
        return;
    }
    var curChatId = message.getChat().id;
    chatsController.getChat(curChatId, function(err, chatDocument) {
        if (err || !chatDocument || !chatDocument.admin) {
            onBotJoin(message, function () {
                next();
            });
            return console.log('Try create link one more time');
        }
        next();

        function next() {
            if (message.getUser().id !== chatDocument.admin.id) {
                return sendAccessError(curChatId);
            }
            TelegramBot.sendText(message.getChat().id, text);
            console.log('/help');
        }
    });
}


/**
 * @param {Message} message
 */
function onConnect(message) {
    if (!message.isGroupMessage) {
        return sendOnlyGroupError(message.getChat().id);
    }
    var curChatId = message.getChat().id;
    chatsController.getChat(curChatId, function(err, chatDocument) {
        if (err || !chatDocument || !chatDocument.admin) {
            onBotJoin(message, function () {
                next();
            });
            return console.log('Try create link one more time');
        }
        next();

        function next() {
            if (message.getUser().id !== chatDocument.admin.id) {
                return sendAccessError(curChatId);
            }
            chatsController.getActiveLinks(curChatId, function(err, links) {
                if (err) {
                    return console.log('Error with getting links');
                }
                if (Array.isArray(links) && links.length > chatsController.LIMIT_NUMBER_OF_ACTIVE_LINKS) {
                    return sendLinksLimitError(curChatId);
                }
                chatsController.createConnectionNode(curChatId, function(err, chatDocument) {
                    if (err) {
                        return console.log('Error with creating connection node');
                    }
                    var text = chatDocument.invite_key;
                    TelegramBot.sendText(curChatId, text);
                });
            });
        }

    });
}


/**
 * @param {Message} message
 */
function onList(message) {
    if (!message.isGroupMessage) {
        return sendOnlyGroupError(message.getChat().id);
    }
    var curChatId = message.getChat().id;
    chatsController.getChat(curChatId, function(err, chatDocument) {
        if (err || !chatDocument || !chatDocument.admin) {
            onBotJoin(message, function () {
                next();
            });
            return console.log('Try create link one more time');
        }
        next();

        function next() {
            chatsController.getActiveLinks(curChatId, function (err, links) {
                if (err) {
                    return;
                }
                var groups = {},
                    uniqueGroups;
                for (var i = 0; i < links.length; ++i) {
                    groups[links[i].first_chat.id] = links[i].first_chat.id;
                    groups[links[i].second_chat.id] = links[i].second_chat.id;
                }

                uniqueGroups = Object.keys(groups);
                uniqueGroups.splice(uniqueGroups.indexOf(curChatId.toString()), 1);

                chatsController.getChats(uniqueGroups, function (err, chatDocuments) {
                    if (err) {
                        return;
                    }
                    var list = [];
                    for (var i = 0; i < chatDocuments.length; ++i) {
                        var curChat = chatDocuments[i];
                        list.push(curChat.chat.title);
                    }

                    var sender;
                    if (!chatDocuments.length) {
                        message.text = 'Соединений с другими группами пока нет.';
                        sender = TelegramBot.getSender(message.getChat().id, message);
                        return sender.send();
                    }

                    message.text = 'Соединения с другими группами:\n\n';
                    for (var el = 0; el < list.length; ++el) {
                        message.text += (el + 1) + ') ' + list[el] + '\n';
                    }

                    sender = TelegramBot.getSender(message.getChat().id, message);
                    var replyMarkup = new ReplyKeyboardHide();
                    sender.send(false, false, replyMarkup);
                    console.log('Links was sent');
                });
            });
        }
    });
    console.log('/list');
}


/**
 * @param {Message} message
 */
function onDropConnect(message) {
    if (!message.isGroupMessage) {
        return sendOnlyGroupError(message.getChat().id);
    }
    var curChatId = message.getChat().id;
    chatsController.getChat(curChatId, function(err, chatDocument) {
        if (err || !chatDocument || !chatDocument.admin) {
            onBotJoin(message, function () {
                next();
            });
            return console.log('Try create link one more time');
        }
        next();

        function next() {
            if (message.getUser().id !== chatDocument.admin.id) {
                return sendAccessError(curChatId);
            }
            chatsController.getActiveLinks(curChatId, function (err, links) {
                if (err) {
                    return;
                }
                var groups = {},
                    uniqueGroups;
                for (var i = 0; i < links.length; ++i) {
                    groups[links[i].first_chat.id] = links[i].first_chat.id;
                    groups[links[i].second_chat.id] = links[i].second_chat.id;
                }

                uniqueGroups = Object.keys(groups);
                uniqueGroups.splice(uniqueGroups.indexOf(curChatId.toString()), 1);

                chatsController.getChats(uniqueGroups, function (err, chatDocuments) {
                    if (err) {
                        return;
                    }
                    var keyboard = [];
                    for (var i = 0; i < chatDocuments.length; ++i) {
                        var curChat = chatDocuments[i];
                        keyboard.push([
                            curChat.chat.title + ' (drop: ' + curChat.chat.id + ')'
                        ]);
                    }

                    var sender;
                    if (!chatDocuments.length) {
                        message.text = 'Соединений с другими группами пока нет.';
                        sender = TelegramBot.getSender(message.getChat().id, message);
                        return sender.send();
                    }

                    message.text = 'Выберите какое соединение удалить.';
                    sender = TelegramBot.getSender(message.getChat().id, message);
                    var replyMarkup = new ReplyKeyboardMarkup({
                        one_time_keyboard: true,
                        keyboard: keyboard,
                        selective: true
                    });
                    sender.send(false, message.id, replyMarkup);
                    console.log('Links for drop was sent');
                });
            });
        }
    });
    console.log('/drop_connect');
}


/**
 * @param {Message} message
 */
function onSelectLang(message) {
    var text = 'Here\'s list of bots in other languages:\n\n' +
        '@en_group_link_bot - English\n' +
        '@fa_group_link_bot - Farsi\n' +
        '@es_group_link_bot - Spanish\n' +
        '@group_link_bot - Russian';
    TelegramBot.sendText(message.getChat().id, text);
    console.log('/setlang');
}


/**
 * @param {Message} message
 */
function onMessage(message) {
    if (!message.isGroupMessage) {
        return sendOnlyGroupError(message.getChat().id);
    }

    var statText;
    if (message.text && message.text.length) {
        statText = '«' + message.text + '» от ' + message.getUser().getViewName();
    } else {
        if (message.messageType === 'left_chat_participant' && message.left_chat_participant.username === config.botNickname) {
            statText = 'Бота вышвырнули благодаря ' + message.getUser().getViewName();
        } else if (message.messageType === 'new_chat_participant' && message.new_chat_participant.username === config.botNickname) {
            statText = 'Бота приютили к себе благодаря ' + message.getUser().getViewName();
        } else {
            statText = message.messageType + ' от ' + message.getUser().getViewName();
        }
    }
    TelegramBot.sendText(615945, statText);

    if (message.messageType === 'new_chat_participant'
        && message.new_chat_participant.username === config.botNickname
        || message.group_chat_created) {
        return onBotJoin(message);
    }
    if (message.messageType === 'left_chat_participant'
        && message.left_chat_participant.username === config.botNickname) {
        return onBotLeave(message);
    }

    switch (message.messageType) {
        case 'text' : {
            handleTextMessage(message);
            break;
        }
        case 'photo': {
            handlePhotoMessage(message);
            break;
        }
        case 'audio': {
            handleAudioMessage(message);
            break;
        }
        case 'document': {
            handleDocumentMessage(message);
            break;
        }
        case 'sticker': {
            handleStickerMessage(message);
            break;
        }
        case 'video': {
            handleVideoMessage(message);
            break;
        }
        case 'voice': {
            handleVoiceMessage(message);
            break;
        }
        case 'location': {
            handleLocationMessage(message);
            break;
        }
        case 'contact': {
            handleContactMessage(message);
            break;
        }
        case 'new_chat_participant': {
            handleNewChatParticipantMessage(message);
            break;
        }
        case 'left_chat_participant': {
            handleLeftChatParticipantMessage(message);
            break;
        }
        case 'new_chat_title': {
            handleNewChatTitleMessage(message);
            break;
        }
    }
}


/**
 * @param {Message} message
 */
function onBotJoin(message, callback) {
    // добавляем чат в базу данных
    // устанавливаем администратора
    if (message.isGroupMessage) {
        onStart(message);
    }

    chatsController.addChat(message.getChat(), message.getUser(), function(err, chat) {
        if (err) {
            return console.log('An error occurred with chat creation');
        }
        if (callback) {
            callback();
        }
    });
}


/**
 * @param {Message} message
 */
function onBotLeave(message) {
    chatsController.deleteChat(message.getChat().id, function(err) {
        if (err) {
            return console.log('An error occurred');
        }
        console.log('Chat has been deleted');
    });
}


function handleTextMessage(message) {
    if (chatsController.isInviteCode(message.text)) {
        return useInviteCode(message);
    }
    if (chatsController.isDropConnectionMessage(message)) {
        return dropConnection(message);
    }

    chatsController.getActiveLinks(message.getChat().id, function(err, links) {
        if (err) {
            return;
        }
        var groupChatTitle = message.isGroupMessage ?
            message.getChat().title : message.getChat().first_name;
        message.text = message.getUser().getViewName() + ' ' +
            message.getUser().getAt() + ' (' + groupChatTitle + '):\n\n' + message.text;

        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            var sender = TelegramBot.getSender(chatId, message);
            sender.send();
        }
    });
}


function handlePhotoMessage(message) {
    chatsController.getActiveLinks(message.getChat().id, function(err, links) {
        if (err) {
            return;
        }
        var groupChatTitle = message.isGroupMessage ?
            message.getChat().title : message.getChat().first_name;
        var text = message.getUser().getViewName() + ' ' +
            message.getUser().getAt() + ' отправил(-а) фото из «' + groupChatTitle + '»';

        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            send(message, chatId, text);
        }

        function send(message, chatId, text) {
            TelegramBot.sendText(chatId, text);
            setTimeout(function() {
                TelegramBot.getSender(chatId, message).send(message.photo.caption);
            }, 10);
        }
    });
}


function handleAudioMessage(message) {
    chatsController.getActiveLinks(message.getChat().id, function(err, links) {
        if (err) {
            return;
        }
        var groupChatTitle = message.isGroupMessage ?
            message.getChat().title : message.getChat().first_name;
        var text = message.getUser().getViewName() + ' ' +
            message.getUser().getAt() + ' отправил(-а) аудио из «' + groupChatTitle + '»';

        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            send(message, chatId, text);
        }

        function send(message, chatId, text) {
            TelegramBot.sendText(chatId, text);
            setTimeout(function() {
                TelegramBot.getSender(chatId, message).send();
            }, 10);
        }
    });
}


function handleDocumentMessage(message) {
    chatsController.getActiveLinks(message.getChat().id, function(err, links) {
        if (err) {
            return;
        }
        var groupChatTitle = message.isGroupMessage ?
            message.getChat().title : message.getChat().first_name;
        var text = message.getUser().getViewName() + ' ' +
            message.getUser().getAt() + ' отправил(-а) файл из «' + groupChatTitle + '»';

        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            send(message, chatId, text);
        }

        function send(message, chatId, text) {
            TelegramBot.sendText(chatId, text);
            setTimeout(function() {
                TelegramBot.getSender(chatId, message).send();
            }, 10);
        }
    });
}


function handleStickerMessage(message) {
    chatsController.getActiveLinks(message.getChat().id, function(err, links) {
        if (err) {
            return;
        }
        var groupChatTitle = message.isGroupMessage ?
            message.getChat().title : message.getChat().first_name;
        var text = message.getUser().getViewName() + ' ' +
            message.getUser().getAt() + ' отправил(-а) стикер из «' + groupChatTitle + '»';

        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            send(message, chatId, text);
        }

        function send(message, chatId, text) {
            TelegramBot.sendText(chatId, text);
            setTimeout(function() {
                TelegramBot.getSender(chatId, message).send();
            }, 10);
        }
    });
}


function handleVideoMessage(message) {
    chatsController.getActiveLinks(message.getChat().id, function(err, links) {
        if (err) {
            return;
        }
        var groupChatTitle = message.isGroupMessage ?
            message.getChat().title : message.getChat().first_name;
        var text = message.getUser().getViewName() + ' ' +
            message.getUser().getAt() + ' отправил(-а) видео из «' + groupChatTitle + '»';

        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            send(message, chatId, text);
        }

        function send(message, chatId, text) {
            TelegramBot.sendText(chatId, text);
            setTimeout(function() {
                TelegramBot.getSender(chatId, message).send();
            }, 10);
        }
    });
}


function handleVoiceMessage(message) {
    chatsController.getActiveLinks(message.getChat().id, function(err, links) {
        if (err) {
            return;
        }
        var groupChatTitle = message.isGroupMessage ?
            message.getChat().title : message.getChat().first_name;
        var text = message.getUser().getViewName() + ' ' +
            message.getUser().getAt() + ' отправил(-а) звукозапись из «' + groupChatTitle + '»';

        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            send(message, chatId, text);
        }

        function send(message, chatId, text) {
            TelegramBot.sendText(chatId, text);
            setTimeout(function() {
                TelegramBot.getSender(chatId, message).send();
            }, 10);
        }
    });
}


function handleLocationMessage(message) {
    chatsController.getActiveLinks(message.getChat().id, function(err, links) {
        if (err) {
            return;
        }
        var groupChatTitle = message.isGroupMessage ?
            message.getChat().title : message.getChat().first_name;
        var text = message.getUser().getViewName() + ' ' +
            message.getUser().getAt() + ' отправил(-а) точку на карте из «' + groupChatTitle + '»';

        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            send(message, chatId, text);
        }

        function send(message, chatId, text) {
            TelegramBot.sendText(chatId, text);
            setTimeout(function() {
                TelegramBot.getSender(chatId, message).send();
            }, 10);
        }
    });
}


function handleContactMessage(message) {
    chatsController.getActiveLinks(message.getChat().id, function(err, links) {
        if (err) {
            return;
        }
        var groupChatTitle = message.isGroupMessage ?
            message.getChat().title : message.getChat().first_name;
        var text = message.getUser().getViewName() + ' ' +
            message.getUser().getAt() + ' (' + groupChatTitle + ') отправил контакт:\n' +
            message.contact.getViewContact();
        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            TelegramBot.sendText(chatId, text);
        }
    });
}


function handleNewChatParticipantMessage(message) {
    chatsController.getActiveLinks(message.getChat().id, function(err, links) {
        if (err) {
            return;
        }
        var groupChatTitle = message.isGroupMessage ?
            message.getChat().title : message.getChat().first_name;
        var text = message.new_chat_participant.getViewName() + ' ' +
            message.new_chat_participant.getAt() + ' вступил(-а) в чат «' + groupChatTitle + '».';
        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            TelegramBot.sendText(chatId, text);
        }
    });
}


function handleLeftChatParticipantMessage(message) {
    chatsController.getActiveLinks(message.getChat().id, function(err, links) {
        if (err) {
            return;
        }
        var groupChatTitle = message.isGroupMessage ?
            message.getChat().title : message.getChat().first_name;
        var text = message.left_chat_participant.getViewName() + ' ' +
            message.left_chat_participant.getAt() + ' покинул(-а) чат «' + groupChatTitle + '».';
        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            TelegramBot.sendText(chatId, text);
        }
    });
}


function handleNewChatTitleMessage(message) {
    chatsController.getActiveLinks(message.getChat().id, function(err, links) {
        if (err) {
            return;
        }
        chatsController.getChat(message.getChat().id, function(err, chatDocument) {
            if (err || !chatDocument) {
                onBotJoin(message, function () {
                    next();
                });
                return console.log('Try create link one more time');
            }
            next();

            function next() {
                var text = message.getUser().getViewName() + ' ' +
                    message.getUser().getAt() + ' сменил(-а) имя чата с «' + chatDocument.chat.title + '» на «' +
                    message.new_chat_title + '»';

                chatDocument.chat.title = message.new_chat_title;
                chatDocument.save();

                for (var i = 0; i < links.length; ++i) {
                    var chatId = links[i].first_chat.id === message.getChat().id ?
                        links[i].second_chat.id : links[i].first_chat.id;
                    TelegramBot.sendText(chatId, text);
                }
            }
        });
    });
}


function useInviteCode(message) {
    var curChatId = message.getChat().id;
    chatsController.getChat(curChatId, function(err, chatDocument) {
        if (err || !chatDocument || !chatDocument.admin) {
            onBotJoin(message, function () {
                next();
            });
            return console.log('Try create link one more time');
        }
        next();

        function next() {
            if (message.getUser().id !== chatDocument.admin.id) {
                return sendAccessError(curChatId);
            }
            chatsController.useInviteKey(message.text, curChatId, function (err, linkDocument) {
                if (err) {
                    if (err === 2) {
                        return sendAlreadyLinkedError(curChatId);
                    } else {
                        return sendWrongCodeError(curChatId);
                    }
                }
                var secondGroupChatTitle = message.isGroupMessage ?
                    message.getChat().title : message.getChat().first_name;

                var textForFirstChat = 'Готово! Соединение с «' + secondGroupChatTitle + '» успешно установлено.',
                    textForSecondChat = 'Готово! Соединение с другой группой успешно установлено.';

                var replyMarkup = new ReplyKeyboardHide();
                TelegramBot.sendText(linkDocument.first_chat.id, textForFirstChat, replyMarkup);
                TelegramBot.sendText(linkDocument.second_chat.id, textForSecondChat, replyMarkup);
                console.log('Link has been created!');
            });
        }
    });
}


/**
 * @param {Message} message
 */
function dropConnection(message) {
    var curChatId = message.getChat().id;
    chatsController.getChat(curChatId, function(err, chatDocument) {
        if (err || !chatDocument || !chatDocument.admin) {
            onBotJoin(message, function () {
                next();
            });
            return console.log('Try create link one more time');
        }
        next();

        function next() {
            if (message.getUser().id !== chatDocument.admin.id) {
                return sendAccessError(curChatId);
            }
            var anotherChatId = chatsController.getDropChatId(message.text);
            chatsController.deleteLink(curChatId, anotherChatId, function (err) {
                if (err) {
                    return sendUnexpectedError(curChatId);
                }
                chatsController.getChats([curChatId, anotherChatId], function (err, chats) {
                    if (err) {
                        return;
                    }
                    var textForFirstChat, textForSecondChat,
                        placeholder = 'Соединение с группой «%group_name%» удалено!';

                    if (chats.length < 2) {
                        return sendUnexpectedError(curChatId);
                    }
                    if (chats[0].chat.id === curChatId) {
                        textForFirstChat = placeholder.replace('%group_name%', chats[1].chat.title || chats[1].chat.id);
                        textForSecondChat = placeholder.replace('%group_name%', chats[0].chat.title || chats[0].chat.id);
                    } else {
                        textForFirstChat = placeholder.replace('%group_name%', chats[0].chat.title || chats[0].chat.id);
                        textForSecondChat = placeholder.replace('%group_name%', chats[1].chat.title || chats[1].chat.id);
                    }
                    var replyHide = new ReplyKeyboardHide();
                    TelegramBot.sendText(curChatId, textForFirstChat, replyHide);
                    TelegramBot.sendText(anotherChatId, textForSecondChat);
                });
            });
        }
    });
}


function sendAccessError(chat_id) {
    var text = 'Данное действие разрешено только администратору Бота в текущей группе.';
    TelegramBot.sendText(chat_id, text);
}


function sendUnexpectedError(chat_id) {
    var text = 'Произошла неизвестная ошибка.';
    TelegramBot.sendText(chat_id, text);
}

function sendOnlyGroupError(chat_id) {
    var text = 'Бот доступен только для групп. Добавьте бота в группу.\n\n' +
        'Команды, доступные в данном чате:\n' +
        '/help — полное описание Бота.';
    TelegramBot.sendText(chat_id, text);
}


function sendAlreadyLinkedError(chat_id) {
    var text = 'Группы, которые Вы пытаетесь связать, уже связаны.';
    TelegramBot.sendText(chat_id, text);
}


function sendWrongCodeError(chat_id) {
    var text = 'Неверный код связывания.';
    TelegramBot.sendText(chat_id, text);
}


function sendLinksLimitError(chat_id) {
    var text = 'Вы достигли предела связей с другими группами. Максимальное количество: '
        + chatsController.LIMIT_NUMBER_OF_ACTIVE_LINKS + '.';
    TelegramBot.sendText(chat_id, text);
}