function Photo(photoArr, caption) {
    if (!Array.isArray(photoArr)) {
        photoArr = [];
    }
    this.photoArr = photoArr;
    this.caption = caption;
}

Photo.prototype.getObjectFactory = function() {
    return this.photoArr;
};

module.exports = Photo;