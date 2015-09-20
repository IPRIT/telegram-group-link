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

TelegramBot.on('/setlang', onSelectLang);

TelegramBot.on('message', onMessage);


/**
 * @param {Message} message
 */
function onStart(message) {

var text = 'خوش آمدید\n\n' +
        'این روبوت به شما کمک می کند گروههای تلگرام را به هم متصل کنید. هر پیغامی (متن، تصویر، فیلم، فایل و ...) به گروه شما ارسال شود، بطور اتوماتیک به سایر گروههای متصل شده نیز ارسال می شود. \n\n' +
        'کار با این روبوت بسیار ساده است. فقط کافیست پیغام دستوری /connect را برای روبوت ارسال کنید و کدی را که دریافت می کنید به گروه دوم ارسال کنید. همین.\n\n' +
        'برای آشنایی بیشتر با روش کار و امکانات این روبوت، پیغام دستوری /help را ارسال کنید.';

    TelegramBot.sendText(message.getChat().id, text);
    console.log('/start');
}


/**
 * @param {Message} message
 */
function onHelp(message) {
    var text = 'این راهنما به شما کمک می کند با امکانات این روبوت بیشتر آشنا شوید.\n\n' +
        'با کمک این روبوت، می توانید تا 20 گروه را به یک گروه متصل کنید .\n\n' +
        'کسی که روبوت را به گروه اضافه میکند، مدیر روبوت خواهد بود.\n' +
        'و این امکانات را خواهد داشت:\n' +
        '1) دریافت کد یکبار مصرف برای اتصال گروه های دیگر به این گروه Get a one-time code to connect with another group.\n' +
        '2) حذف اتصال بین این گروه با گروه های دیگر .\n' +
        '3) ارسال کدی که از روبوت در گروه دیگری دریافت کرده، برای اتصال این گروه به گروه دیگر. اتصال گروه ها را می توان به وسیله یک نفر یا دونفر انجام شود. \n\n' +
        'مثال: شما روبوت را به گروه الف اضافه می کنید. اکنون شما مدیر روبوت در این گروه هستید. حال می توانید با ارسال دستور /connect کد اتصال را دریافت کرده و برای دوست خود که عضو گروه ب  است می فرستید. دوست شما باید مدیر روبوت در گروه ب باشد. وقتی دوست شما کد را در گروه ب ارسال کند دو گروه به هم متصل خواهند شد.\n' +
        'مدیران روبوت در گروههای الف و ب می توانند ارتباط گروهها را حذف کنند. \n' +
        'برای این کار کافی است مدیر روبوت پیغام دستوری /drop_connect را در گروه خود ارسال کند.\n\n' +
        'تمام اعضای گروه می توانند با ارسال پیغام دستوری /list لیست گروههای متصل را مشاهده کنند.\n\n' +
        'لیست دستورها: \n' +
        '/connect — برای دریافت کد اتصال به گروه دیگر. این کد را فقط مدیر روبوت در گروه می تواند به کار ببرد. دیگران هم کد را می بینند، ولی چون یکبار مصرف است برای ایشان کاربردی ندارد *.\n' +
        '/drop_connect — حذف اتصال با گروه مورد نظر.\n' +
        '/list — مشاهده لیست گروههای متصل به هم.\n' +
        '/help — مشاهده این متن راهنما.\n\n' +
        '* — اگر کسی در گروه زودتر از شما لینک را برداشت و برای اتصال گروهتان به گروهی ناشناخته استفاده کرد نگران نشوید. شما هر وقت بخواهید می توانید اتصالها را مشاهده و حذف کنید، و یا کد اتصال جدید دریافت کنید.\n\n' +
        'این روبوت به صورت متن-باز نوشته شده و در آدرس زیر قابل مشاهده و پیگیری است. \n https://github.com/IPRIT/telegram-group-link \n' +
        'و از همکاری شما برای توسعه و رفع ایرادهای احتمالی استقبال می شود!\n' +
        'هر گونه سوال یا پیشنهادی داشته باشید، همواره می توانید با ما در تماس باشید. \n نویسنده کد اصلی: @belov \n ترجمه به فارسی: @shgzs    ).';


    TelegramBot.sendText(message.getChat().id, text);
    console.log('/help');
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
        if (err) {
            return console.log('An error occurred with link creation');
        }
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
        if (err || !chatDocument) {
            return console.log('An error occurred with getting chat');
        }
        chatsController.getActiveLinks(curChatId, function(err, links) {
            if (err) {
                return;
            }
            var groups = {},
                uniqueGroups;
            for (var i = 0; i < links.length; ++i) {
                groups[ links[i].first_chat.id ] = links[i].first_chat.id;
                groups[ links[i].second_chat.id ] = links[i].second_chat.id;
            }

            uniqueGroups = Object.keys(groups);
            uniqueGroups.splice(uniqueGroups.indexOf(curChatId.toString()), 1);

            chatsController.getChats(uniqueGroups, function(err, chatDocuments) {
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
                    message.text = 'هنوز هیچ اتصالی به گروههای دیگر وجود ندارد.';
                    sender = TelegramBot.getSender(message.getChat().id, message);
                    return sender.send();
                }

                message.text = 'اتصال این گروه با گروههای دیگر:\n\n';
                for (var el = 0; el < list.length; ++el) {
                    message.text += (el + 1) + ') ' + list[el] + '\n';
                }

                sender = TelegramBot.getSender(message.getChat().id, message);
                var replyMarkup = new ReplyKeyboardHide();
                sender.send(false, false, replyMarkup);
                console.log('Links was sent');
            });
        });
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
        if (err || !chatDocument) {
            return console.log('An error occurred with getting chat');
        }
        if (message.getUser().id !== chatDocument.admin.id) {
            return sendAccessError(curChatId);
        }
        chatsController.getActiveLinks(curChatId, function(err, links) {
            if (err) {
                return;
            }
            var groups = {},
                uniqueGroups;
            for (var i = 0; i < links.length; ++i) {
                groups[ links[i].first_chat.id ] = links[i].first_chat.id;
                groups[ links[i].second_chat.id ] = links[i].second_chat.id;
            }

            uniqueGroups = Object.keys(groups);
            uniqueGroups.splice(uniqueGroups.indexOf(curChatId.toString()), 1);

            chatsController.getChats(uniqueGroups, function(err, chatDocuments) {
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
                    message.text = 'هنوز هیچ اتصالی به گروههای دیگر وجود ندارد.';
                    sender = TelegramBot.getSender(message.getChat().id, message);
                    return sender.send();
                }

                message.text = 'اتصالی که می خواهید حذف کنید را انتخاب کنید.';
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
    });
    console.log('/drop_connect');
}


/**
 * @param {Message} message
 */
function onSelectLang(message) {
    console.log('/setlang');
}


/**
 * @param {Message} message
 */
function onMessage(message) {
    if (!message.isGroupMessage) {
        return sendOnlyGroupError(message.getChat().id);
    }
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
function onBotJoin(message) {
    // добавляем чат в базу данных
    // устанавливаем администратора
    if (message.isGroupMessage) {
        onStart(message);
    }

    chatsController.addChat(message.getChat(), message.getUser(), function(err, chat) {
        if (err) {
            return console.log('An error occurred with chat creation');
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
            message.getUser().getAt() + ' (' + groupChatTitle + '):\n' + message.text;

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
            message.getUser().getAt() + ' تصویری به گروه «' + groupChatTitle + '» ارسال کرد. ';

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


function handleAudioMessage(message) {
    chatsController.getActiveLinks(message.getChat().id, function(err, links) {
        if (err) {
            return;
        }
        var groupChatTitle = message.isGroupMessage ?
            message.getChat().title : message.getChat().first_name;
        var text = message.getUser().getViewName() + ' ' +
            message.getUser().getAt() + ' یک فایل صوتی به گروه «' + groupChatTitle + '» ارسال کرد.';

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
            message.getUser().getAt() + ' فایلی به گروه «' + groupChatTitle + '» ارسال کرد';

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
            message.getUser().getAt() + ' یک استیکر به گروه «' + groupChatTitle + '» ارسال کرد. ';

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
            message.getUser().getAt() + ' فیلمی به گروه «' + groupChatTitle + '» ارسال کرد. ';

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
            message.getUser().getAt() + ' صدای ضبط شده ای به گروه «' + groupChatTitle + '» ارسال کرد.';

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
            message.getUser().getAt() + ' موقعیت خود را به گروه «' + groupChatTitle + '» ارسال کرد. ';

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
            message.getUser().getAt() + ' (' + groupChatTitle + ') اطلاعات تماس ارسال کرد:\n' +
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
            message.new_chat_participant.getAt() + ' به گروه «' + groupChatTitle + '» پیوست.';
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
            message.left_chat_participant.getAt() + ' گروه «' + groupChatTitle + '» را ترک کرد.';
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
            if (err) {
                return;
            }
            var text = message.getUser().getViewName() + ' ' +
                message.getUser().getAt() + ' نام گروه را از «' + chatDocument.chat.title + '» به «' +
                message.new_chat_title + '» تغییر داد';

            chatDocument.chat.title = message.new_chat_title;
            chatDocument.save();

            for (var i = 0; i < links.length; ++i) {
                var chatId = links[i].first_chat.id === message.getChat().id ?
                    links[i].second_chat.id : links[i].first_chat.id;
                TelegramBot.sendText(chatId, text);
            }
        });
    });
}


function useInviteCode(message) {
    var curChatId = message.getChat().id;
    chatsController.getChat(curChatId, function(err, chatDocument) {
        if (err || !chatDocument) {
            return console.log('در فعالسازی کد اتصال خطایی رخ داد.');
        }
        if (message.getUser().id !== chatDocument.admin.id) {
            return sendAccessError(curChatId);
        }
        chatsController.useInviteKey(message.text, curChatId, function(err, linkDocument) {
            if (err) {
                if (err === 2) {
                    return sendAlreadyLinkedError(curChatId);
                } else {
                    return sendWrongCodeError(curChatId);
                }
            }
            var secondGroupChatTitle = message.isGroupMessage ?
                message.getChat().title : message.getChat().first_name;

            var textForFirstChat = 'اتصال به گروه «' + secondGroupChatTitle + '» با موفقیت برقرار شد.',
                textForSecondChat = 'اتصال با گروه دیگر با موفقیت برقرار شد.';

            var replyMarkup = new ReplyKeyboardHide();
            TelegramBot.sendText(linkDocument.first_chat.id, textForFirstChat, replyMarkup);
            TelegramBot.sendText(linkDocument.second_chat.id, textForSecondChat, replyMarkup);
            console.log('اتصال برقرار گردید!');
        });
    });
}


/**
 * @param {Message} message
 */
function dropConnection(message) {
    var curChatId = message.getChat().id;
    chatsController.getChat(curChatId, function(err, chatDocument) {
        if (err || !chatDocument) {
            return console.log('An error occurred with dropping link');
        }
        if (message.getUser().id !== chatDocument.admin.id) {
            return sendAccessError(curChatId);
        }
        var anotherChatId = chatsController.getDropChatId(message.text) ;
        chatsController.deleteLink(curChatId, anotherChatId, function(err) {
            if (err) {
                return sendUnexpectedError(curChatId);
            }
            chatsController.getChats([curChatId, anotherChatId], function(err, chats) {
                if (err) {
                    return;
                }
                var textForFirstChat, textForSecondChat,
                    placeholder = 'اتصال با گروه «%group_name%» حذف شد!';

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
    });
}


function sendAccessError(chat_id) {
    var text = 'این عملیات فقط برای مدیر روبوت در گروه امکان پذیر است.';
    TelegramBot.sendText(chat_id, text);
}


function sendUnexpectedError(chat_id) {
    var text = 'An unknown error occurred.';
    TelegramBot.sendText(chat_id, text);
}

function sendOnlyGroupError(chat_id) {
    var text = 'این دستور فقط در گروهها قابل استفاده است. ابتدا باید روبوت را به گروه های مورد نظر خود اضافه کنید.\n\n' +
        'دستورهایی که به طور مستقیم و خارج از گروه قابل استفاده است :\n' +
        '/help — جزئیات بیشتر و راهنمای استفاده از روبوت.';
    TelegramBot.sendText(chat_id, text);
}


function sendAlreadyLinkedError(chat_id) {
    var text = 'گروههایی که می خواهید به هم متصل کنید، قبلا متصل شده اند.';
    TelegramBot.sendText(chat_id, text);
}


function sendWrongCodeError(chat_id) {
    var text = 'کد اتصال نادرست است.';
    TelegramBot.sendText(chat_id, text);
}


function sendLinksLimitError(chat_id) {
    var text = 'تعداد گروههای متصل شده به حداکثر مجاز خود یعنی :'
        + chatsController.LIMIT_NUMBER_OF_ACTIVE_LINKS + ' گروه رسیده است.';
    TelegramBot.sendText(chat_id, text);
}
