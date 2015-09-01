var mongoose    = require('mongoose');
var config      = require('./config');

mongoose.connect(config.mongoose.uri);

var db = mongoose.connection;

db.on('error', function error(err) {
    console.log('Connection error:', err.message);
});

db.once('open', function callback() {
    console.log("Connected to MongoDB!");
});

var Schema = mongoose.Schema;

// Schemas
var Chats = new Schema({
    chat: {
        id: {
            type: Number,
            index: true
        }
    },
    admin: {
        id: {
            type: Number,
            index: true
        }
    },
    language: {
        type: String,
        enum: [
            'en-US',
            'ru-RU'
        ],
        default: 'ru-RU'
    },
    created: {
        type: Date,
        default: Date.now
    }
});

var Links = new Schema({
    first_chat: {
        id: {
            type: Number,
            index: true
        }
    },
    second_chat: {
        id: {
            type: Number,
            index: true
        }
    },
    invite_key: {
        type: String,
        index: true
    }
});

var ChatsModel = mongoose.model('Chats', Chats);
var LinksModel = mongoose.model('Links', Links);

module.exports = {
    ChatsModel: ChatsModel,
    LinksModel: LinksModel
};