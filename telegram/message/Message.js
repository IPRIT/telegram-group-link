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
        this.audio = new Audio(message.audio);
    }

    if (message.document) {
        this.messageType = 'document';
        this.document = new Document(message.document);
    }

    if (message.photo) {
        this.messageType = 'photo';
        var photoSizes = [];
        for (var el in message.photo) {
            photoSizes.push(new PhotoSize(message.photo[el]));
        }
        this.photo = new Photo(photoSizes);
    }

    if (message.sticker) {
        this.messageType = 'sticker';
        this.sticker = new Sticker(message.sticker);
    }

    if (message.video) {
        this.messageType = 'video';
        this.video = new Video(message.video);
    }

    if (message.voice) {
        this.messageType = 'voice';
        this.voice = new Voice(message.voice);
    }

    if (message.contact) {
        this.messageType = 'contact';
        this.contact = new Contact(message.contact);
    }

    if (message.location) {
        this.messageType = 'location';
        this.location = new Location(message.location);
    }

    if (message.new_chat_participant) {
        this.messageType = 'new_chat_participant';
        this.new_chat_participant = new User(message.new_chat_participant);
    }

    if (message.left_chat_participant) {
        this.messageType = 'left_chat_participant';
        this.left_chat_participant = new User(message.left_chat_participant);
    }

    if (message.new_chat_title) {
        this.messageType = 'new_chat_title';
        this.new_chat_title = message.new_chat_title;
    }

    if (message.new_chat_photo) {
        this.messageType = 'new_chat_photo';
        var pSizes = [];
        for (var i in message.new_chat_photo) {
            pSizes.push(new PhotoSize(message.new_chat_photo[i]));
        }
        this.new_chat_photo = new Photo(pSizes);
    }

    if (message.delete_chat_photo) {
        this.messageType = 'delete_chat_photo';
        this.delete_chat_photo = true;
    }

    if (message.group_chat_created) {
        this.messageType = 'group_chat_created';
        this.group_chat_created = true;
    }
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
    if (!~events.indexOf('message')) {
        events.splice(events.indexOf('message'), 1);
    }
    var regex = new RegExp('^(\\/(' + events.join('|').replace(/\//gi, '') +
        ')(?=\\@' + ownNickname + '|\\s|$))', 'i');
    return regex.test(this.text);
};


Message.prototype.getCommand = function() {
    var matches = this.text.match(/^(\/\w+)/i);
    return matches[0];
};

module.exports = Message;