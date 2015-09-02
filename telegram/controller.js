var db = require('../db/db');
var ChatsModel = db.ChatsModel;
var LinksModel = db.LinksModel;

function Controller() {
    this.name = 'Controller';
}


/**
 * @type {number}
 */
Controller.prototype.LIMIT_NUMBER_OF_ACTIVE_LINKS = 20;


/**
 * @param chat
 * @param admin
 * @param callback
 */
Controller.prototype.addChat = function(chat, admin, callback) {
    ChatsModel.findOne({ 'chat.id': chat.id }, function(err, chatDocument) {
        if (err || chatDocument) {
            return callback(true);
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
        console.log('Chat has been created');
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
Controller.prototype.createConnectionNode = function(chat_id, callback) {
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
    var _this = this;
    this.getActiveLinks(chat_id, function(err, links) {
        if (err || links.length > _this.LIMIT_NUMBER_OF_ACTIVE_LINKS) {
            return callback(true);
        }

        LinksModel.findOne({ 'invite_key': invite_key }, function(err, linkDocument) {
            if (err || !linkDocument
                || linkDocument.first_chat.id === chat_id
                || linkDocument.invite_key !== invite_key) {
                return callback(true);
            }

            for (var i = 0; i < links.length; ++i) {
                if (links[i].first_chat.id === linkDocument.first_chat.id
                    && links[i].second_chat.id === chat_id
                    || links[i].first_chat.id === chat_id
                    && links[i].second_chat.id === linkDocument.first_chat.id) {
                    return callback(2);
                }
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
    });
};

Controller.prototype.getActiveLinks = function(chat_id, callback) {
    LinksModel.find({
        $and: [{
            $or: [{
                'first_chat.id': chat_id
            }, {
                'second_chat.id': chat_id
            }]
        }, {
            invite_key: 'used'
        }]
    }, function(err, linksCollection) {
        if (err) {
            return callback(true);
        }
        callback(false, linksCollection);
    });
};


Controller.prototype.deleteLink = function(first_chat_id, second_chat_id, callback) {
    LinksModel.findOneAndRemove({
        $or: [{
            $and: [{
                'first_chat.id': first_chat_id
            }, {
                'second_chat.id': second_chat_id
            }, {
                'invite_key': 'used'
            }]
        }, {
            $and: [{
                'first_chat.id': second_chat_id
            }, {
                'second_chat.id': first_chat_id
            }, {
                'invite_key': 'used'
            }]
        }]
    }, function(err) {
        if (err) {
            return callback(true);
        }
        console.log('Link has been deleted!');
        callback(false);
    });
};


/**
 * @param chat_id
 * @return {string}
 */
function generateInviteKey(chat_id) {
    var chatIdUint16 = Math.abs(chat_id).toString(16),
        key = (Math.random() * 1e6).toString(16).replace('.', '-');
    return chatIdUint16 + ':' + key;
}

function isInviteCode(code) {
    if (!code) {
        return false;
    }
    return /^[0-9a-f]+\:[0-9a-f]+\-?([0-9a-f]+)?$/i.test(code);
}

Controller.prototype.isInviteCode = isInviteCode;

module.exports = Controller;