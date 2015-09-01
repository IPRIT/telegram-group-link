function ForceReply(forceReply) {
    if (!forceReply) {
        forceReply = {};
    }
    this.force_reply = true;
    this.selective = forceReply.selective || false;
}

ForceReply.prototype.getObjectFactory = function() {
    return {
        force_reply: this.force_reply,
        selective: this.selective
    }
};

module.exports = ForceReply;