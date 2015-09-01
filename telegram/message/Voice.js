function Voice(voice) {
    if (!voice) {
        voice = {};
    }
    this.voice = voice;
}

Voice.prototype.getObjectFactory = function() {
    return this.voice;
};