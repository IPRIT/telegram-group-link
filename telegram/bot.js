var unirest = require('unirest');
var events = require('events');
var extend = require('node.extend');
var config = require('./config');

var Message = require('./message/Message');


var TelegramBot = {
    setToken: SetTokenFunction,
    on: AddEventListener,
    off: RemoveEventListener,
    handle: Handle,
    getSender: messageSender,
    sendText: sendSimpleText
};

var _botToken;
var EventEmitter = new events.EventEmitter;
var API_URI = 'https://api.telegram.org/bot#BOT_API_KEY#';

/**
 * @param {string} token
 */
function SetTokenFunction(token) {
    if (!token.length || typeof token !== "string") {
        throw new TypeError('Token should be a string and not empty');
    }
    _botToken = token;
}


/**
 * @param event
 * @param callback
 */
function AddEventListener(event, callback) {
    EventEmitter.on(event, callback);
}

/**
 * @param event
 * @param callback
 */
function RemoveEventListener(event, callback) {
    EventEmitter.removeListener(event, callback);
}

/**
 * @param {object} messageData
 */
function Handle(messageData) {
    var message = new Message(messageData.message);

    if (message.text.length &&
        message.isCommand() &&
        message.isOwnCommand(Object.keys(EventEmitter._events), config.botNickname)) {
        EventEmitter.emit(message.getCommand(), message);
    } else {
        EventEmitter.emit('message', message);
    }
}

/**
 * @param {number} chat_id
 * @param {Message} message
 */
function messageSender(chat_id, message) {
    var requestBody = {
        chat_id: chat_id
    };

    switch (message.messageType) {
        case 'text': {
            return {
                type: 'text',
                send: textMessageSender
            };
        }
        case 'photo': {
            return {
                type: 'photo',
                send: photoMessageSender
            }
        }
        case 'audio': {
            return {
                type: 'audio',
                send: audioMessageSender
            }
        }
        case 'document': {
            return {
                type: 'document',
                send: documentMessageSender
            }
        }
        case 'sticker': {
            return {
                type: 'sticker',
                send: stickerMessageSender
            }
        }
        case 'video': {
            return {
                type: 'video',
                send: videoMessageSender
            }
        }
        case 'voice': {
            return {
                type: 'voice',
                send: voiceMessageSender
            }
        }
        case 'location': {
            return {
                type: 'location',
                send: locationMessageSender
            }
        }
        case 'contact': {
            return {
                type: 'contact',
                send: contactMessageSender
            }
        }
    }

    /**
     * @param {boolean} disable_web_page_preview
     * @param {number|boolean} reply_to_message_id
     * @param {ReplyKeyboardMarkup|ReplyKeyboardHide|ForceReply|boolean} reply_markup
     */
    function textMessageSender(disable_web_page_preview, reply_to_message_id, reply_markup) {
        var textMessageApiUrl = getApiUrl() + '/sendMessage';
        var extendObject = {
            text: message.text,
            disable_web_page_preview: !!disable_web_page_preview
        };
        if (reply_to_message_id) {
            extendObject.reply_to_message_id = reply_to_message_id;
        }
        if (reply_markup) {
            extendObject.reply_markup = JSON.stringify(reply_markup.getObjectFactory());
        }
        var contextRequestBody = extend(true, extendObject, requestBody);
        send(textMessageApiUrl, contextRequestBody);
    }


    function photoMessageSender(caption, reply_to_message_id, reply_markup) {
        var messageApiUrl = getApiUrl() + '/sendPhoto';
        var extendObject = {
            photo: message.photo && message.photo.length > 0 ?
                message.photo[0].file_id : ''
        };
        if (caption) {
            extendObject.caption = caption;
        }
        if (reply_to_message_id) {
            extendObject.reply_to_message_id = reply_to_message_id;
        }
        if (reply_markup) {
            extendObject.reply_markup = JSON.stringify(reply_markup.getObjectFactory());
        }
        var contextRequestBody = extend(true, extendObject, requestBody);
        send(messageApiUrl, contextRequestBody);
    }


    function audioMessageSender(reply_to_message_id, reply_markup) {
        var audioMessageApiUrl = getApiUrl() + '/sendAudio';
        var extendObject = {
            audio: message.audio.file_id
        };
        if (reply_to_message_id) {
            extendObject.reply_to_message_id = reply_to_message_id;
        }
        if (reply_markup) {
            extendObject.reply_markup = JSON.stringify(reply_markup.getObjectFactory());
        }
        var contextRequestBody = extend(true, extendObject, requestBody);
        send(audioMessageApiUrl, contextRequestBody);
    }


    function documentMessageSender(reply_to_message_id, reply_markup) {
        var documentMessageApiUrl = getApiUrl() + '/sendDocument';
        var extendObject = {
            document: message.document.file_id
        };
        if (reply_to_message_id) {
            extendObject.reply_to_message_id = reply_to_message_id;
        }
        if (reply_markup) {
            extendObject.reply_markup = JSON.stringify(reply_markup.getObjectFactory());
        }
        var contextRequestBody = extend(true, extendObject, requestBody);
        send(documentMessageApiUrl, contextRequestBody);
    }


    function stickerMessageSender(reply_to_message_id, reply_markup) {
        var messageApiUrl = getApiUrl() + '/sendSticker';
        var extendObject = {
            sticker: message.sticker.file_id
        };
        if (reply_to_message_id) {
            extendObject.reply_to_message_id = reply_to_message_id;
        }
        if (reply_markup) {
            extendObject.reply_markup = JSON.stringify(reply_markup.getObjectFactory());
        }
        var contextRequestBody = extend(true, extendObject, requestBody);
        send(messageApiUrl, contextRequestBody);
    }


    function videoMessageSender(reply_to_message_id, reply_markup) {
        var messageApiUrl = getApiUrl() + '/sendVideo';
        var extendObject = {
            video: message.video.file_id
        };
        if (reply_to_message_id) {
            extendObject.reply_to_message_id = reply_to_message_id;
        }
        if (reply_markup) {
            extendObject.reply_markup = JSON.stringify(reply_markup.getObjectFactory());
        }
        var contextRequestBody = extend(true, extendObject, requestBody);
        send(messageApiUrl, contextRequestBody);
    }


    function voiceMessageSender(reply_to_message_id, reply_markup) {
        var messageApiUrl = getApiUrl() + '/sendVoice';
        var extendObject = {
            voice: message.voice.file_id
        };
        if (reply_to_message_id) {
            extendObject.reply_to_message_id = reply_to_message_id;
        }
        if (reply_markup) {
            extendObject.reply_markup = JSON.stringify(reply_markup.getObjectFactory());
        }
        var contextRequestBody = extend(true, extendObject, requestBody);
        send(messageApiUrl, contextRequestBody);
    }


    function locationMessageSender(reply_to_message_id, reply_markup) {
        var messageApiUrl = getApiUrl() + '/sendLocation';
        var extendObject = {
            latitude: message.location.latitude,
            longitude: message.location.longitude
        };
        if (reply_to_message_id) {
            extendObject.reply_to_message_id = reply_to_message_id;
        }
        if (reply_markup) {
            extendObject.reply_markup = JSON.stringify(reply_markup.getObjectFactory());
        }
        var contextRequestBody = extend(true, extendObject, requestBody);
        send(messageApiUrl, contextRequestBody);
    }


    function send(url, body) {
        unirest.post(url)
            .header('Accept', 'application/json')
            .send(body)
            .end(function (response) {
                console.log(response.body);
            });
    }
}


/**
 * @return {string} Api url
 */
function getApiUrl() {
    return API_URI.replace('#BOT_API_KEY#', _botToken);
}


function sendSimpleText(chat_id, text, replyMarkup) {
    var textMessageApiUrl = getApiUrl() + '/sendMessage';
    var requestBody = {
        chat_id: chat_id,
        text: text
    };
    if (replyMarkup) {
        requestBody.reply_markup = JSON.stringify(replyMarkup.getObjectFactory());
    }
    unirest.post(textMessageApiUrl)
        .header('Accept', 'application/json')
        .send(requestBody)
        .end(function (response) {
            console.log(response.body);
        });
}

module.exports = TelegramBot;