function Audio(audio) {
    if (!audio) {
        audio = {};
    }
    this.file_id = audio.file_id;
    this.duration = audio.duration;
    this.performer = audio.performer || '';
    this.title = audio.title || '';
    this.mime_type = audio.mime_type || '';
    this.file_size = audio.file_size || 0;
}

Audio.prototype.getObjectFactory = function() {
    return {
        file_id: this.file_id,
        duration: this.duration,
        performer: this.performer,
        title: this.title,
        mime_type: this.mime_type,
        file_size: this.file_size
    }
};

module.exports = Audio;