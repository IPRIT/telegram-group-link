var db = require('../db/db');
var ChatsModel = db.ChatsModel;
var LinksModel = db.LinksModel;

function Controller() {
    this.name = 'Controller';
}


/**
 * @param chat
 * @param admin
 * @param callback
 */
Controller.prototype.addChat = function(chat, admin, callback) {
    ChatsModel.findOne({ 'chat.id': chat.id }, function(err, chatDocument) {
        if (err || chatDocument) {
            callback(true);
        }
        chatDocument = new ChatsModel({
            chat: {
                id: chat.id
            },
            admin: {
                id: admin.id
            }
        });
        chatDocument.save(function(err) {
            if (!err) {
                callback(false, chatDocument);
            } else {
                console.log('An error occurred', err);
            }
        });
    });
};


/**
 * @param chat_id
 * @param callback
 */
Controller.prototype.deleteChat = function(chat_id, callback) {
    ChatsModel.findOneAndRemove({ 'chat.id': chat_id }, function(err) {
        if (err) {
            return callback(true);
        }
        callback(false);
    });
};


/**
 * @param chat_id
 * @param callback
 */
Controller.prototype.getChat = function(chat_id, callback) {
    ChatsModel.findOne({ 'chat.id': chat_id }, function(err, chatDocument) {
        if (err) {
            return callback(true);
        }
        callback(false, chatDocument);
    });
};


/**
 * @param chat_id
 * @param callback
 */
Controller.prototype.createConnection = function(chat_id, callback) {
    ChatsModel.findOne({ 'chat.id': chat_id }, function(err, chatDocument) {
        if (err || !chatDocument) {
            return callback(true);
        }

        var link = new LinksModel({
            first_chat: {
                id: chat_id
            },
            second_chat: {
                id: 0
            },
            invite_key: generateInviteKey(chat_id)
        });
        link.save(function(err) {
            if (!err) {
                callback(false, link);
            } else {
                console.log('An error occurred', err);
            }
        });
    });
};


/**
 * @param invite_key
 * @param chat_id
 * @param callback
 */
Controller.prototype.useInviteKey = function(invite_key, chat_id, callback) {
    LinksModel.findOne({ 'invite_key': invite_key }, function(err, linkDocument) {
        if (err || !linkDocument
            || linkDocument.first_chat.id === chat_id
            || linkDocument.invite_key !== invite_key) {
            return callback(true);
        }
        linkDocument.second_chat.id = chat_id;
        linkDocument.invite_key = 'used';
        linkDocument.save(function(err) {
            if (!err) {
                callback(false, linkDocument);
            } else {
                console.log('An error occurred', err);
            }
        });
    });
};


/**
 * @param chat_id
 * @return {string}
 */
function generateInviteKey(chat_id) {
    var chatId16 = Math.abs(chat_id).toString(16),
        key = (Math.random() * 1e6).toString(16).replace('.', '-');
    return chatId16 + ':' + key;
}

module.exports = Controller;