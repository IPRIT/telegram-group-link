var User = require('./User');
var GroupChat = require('./GroupChat');

function Message(message) {
    this.messageData = message;

    this.user = new User(message.from);
    this.isGroupMessage = message.chat.id < 0;
    this.chat = this.isGroupMessage ?
        new GroupChat(message.chat) :
        new User(message.chat);
    this.text = (message.text || '').trim();

    this.messageType = 'text';

    if (message.audio) {
        this.messageType = 'audio';
    }

    if (message.document) {
        this.messageType = 'document';
    }

    if (message.new_chat_participant) {
        this.messageType = 'new_chat_participant';
        this.new_chat_participant = new User(message.new_chat_participant);
    }

    if (message.left_chat_participant) {
        this.messageType = 'left_chat_participant';
        this.left_chat_participant = new User(message.left_chat_participant);
    }

    //...
}


/**
 * @return {User}
 */
Message.prototype.getUser = function() {
    return this.user;
};


/**
 * @return {User|GroupChat}
 */
Message.prototype.getChat = function() {
    return this.chat;
};


Message.prototype.isCommand = function() {
    return /^\/\w{1,}/i.test(this.text);
};


Message.prototype.isOwnCommand = function(events, ownNickname) {
    if (!Array.isArray(events)
        || !events.length
        || typeof ownNickname !== 'string') {
        return false;
    }
    events.splice(events.indexOf('message'), 1);
    var regex = new RegExp('^(\\/(' + events.join('|').replace(/\//gi, '') +
        ')(?=\\@' + ownNickname + '|\\s|$))', 'i');
    return regex.test(this.text);
};


Message.prototype.getCommand = function() {
    var matches = this.text.match(/^(\/\w+)/i);
    return matches[0];
};

module.exports = Message;