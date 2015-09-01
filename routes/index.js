var express = require('express');
var router = express.Router();
var telegramHandler = require('../telegram/handler');

router.post('/tgwebhook', function(req, res, next) {
    var body = req.body;
    telegramHandler.handler(body);
    res.end();
});

module.exports = router;
