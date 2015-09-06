function ReplyKeyboardMarkup(replyMarkup) {
    if (!replyMarkup) {
        replyMarkup = {};
    }
    this.keyboard = replyMarkup.keyboard || [ [] ];
    this.resize_keyboard = replyMarkup.resize_keyboard || false;
    this.one_time_keyboard = replyMarkup.one_time_keyboard || true;
    this.selective = replyMarkup.selective || false;
}

ReplyKeyboardMarkup.prototype.getObjectFactory = function() {
    return {
        keyboard: this.keyboard,
        resize_keyboard: this.resize_keyboard,
        one_time_keyboard: this.one_time_keyboard,
        selective: this.selective
    };
};

module.exports = ReplyKeyboardMarkup;