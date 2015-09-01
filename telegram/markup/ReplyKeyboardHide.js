function ReplyKeyboardHide(replyHide) {
    if (!replyHide) {
        replyHide = {};
    }
    this.hide_keyboard = true;
    this.selective = replyHide.selective || false;
}

ReplyKeyboardHide.prototype.getObjectFactory = function() {
    return {
        hide_keyboard: this.hide_keyboard,
        selective: this.selective
    };
};

module.exports = ReplyKeyboardHide;