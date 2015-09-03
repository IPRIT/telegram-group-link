function Photo(photoArr) {
    if (!Array.isArray(photoArr)) {
        photoArr = [];
    }
    this.photoArr = photoArr;
}

Photo.prototype.getObjectFactory = function() {
    return this.photoArr;
};

module.exports = Photo;