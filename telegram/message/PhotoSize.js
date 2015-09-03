function PhotoSize(photoSize) {
    if (!photoSize) {
        photoSize = {};
    }
    this.photoSize = photoSize;
    this.file_id = photoSize.file_id;
    this.width = photoSize.width;
    this.height = photoSize.height;
}

PhotoSize.prototype.getObjectFactory = function() {
    return this.photoSize;
};

module.exports = PhotoSize;