function Video(video) {
    if (!video) {
        video = {};
    }
    this.video = video;
}

Video.prototype.getObjectFactory = function() {
    return this.video;
};

module.exports = Video;