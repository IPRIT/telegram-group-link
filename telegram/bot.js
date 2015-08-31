var unirest = require('unirest');

module.exports = {
    handler: BotHandler
};

var chats = [];

function BotHandler(messageObj) {
    var message = messageObj.message;
    var text = message.text;
    var chatId = message.chat.id;
    for (var i = 0; i < chats.length; ++i) {
        if (chatId === chats[i]) continue;
        sendMessage(chats[i], text);
    }
    chats.push(chatId);
}

function sendMessage(chatId, text) {
    unirest.post('https://api.telegram.org/bot114633843:AAFLWQ2lhepMlT1w4zFyGlWpZD4PzmKnHoU/sendMessage')
        .header('Accept', 'application/json')
        .send({
            "chat_id": chatId,
            "text": text
        })
        .end(function (response) {
            console.log(response.body);
        });
}