function Voice(voice) {
    if (!voice) {
        voice = {};
    }
    this.voice = voice;
    this.file_id = voice.file_id;
}

Voice.prototype.getObjectFactory = function() {
    return this.voice;
};

module.exports = Voice;