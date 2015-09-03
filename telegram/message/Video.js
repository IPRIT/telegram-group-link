function Video(video) {
    if (!video) {
        video = {};
    }
    this.video = video;
    this.file_id = video.file_id;
}

Video.prototype.getObjectFactory = function() {
    return this.video;
};

module.exports = Video;