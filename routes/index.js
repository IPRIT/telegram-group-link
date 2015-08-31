var express = require('express');
var router = express.Router();
var telegramBot = require('../telegram/bot');

router.get('/tgwebhook', function(req, res, next) {
    var body = req.body;
    telegramBot.handler(body);
    res.end();
});

module.exports = router;
